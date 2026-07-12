import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const statusToUi: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  IN_PROGRESS: "Active",
  REVIEW_PENDING: "Active",
  CLOSED: "Completed",
  CANCELLED: "Completed",
};

const recordToUi: Record<string, string> = {
  VERIFIED: "Verified",
  MISSING: "Missing",
  DAMAGED: "Damaged",
};

const recordToDb: Record<string, "VERIFIED" | "MISSING" | "DAMAGED"> = {
  Verified: "VERIFIED",
  Missing: "MISSING",
  Damaged: "DAMAGED",
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function scopedAssetWhere(targetType: string, targetValue: string, departmentId?: string) {
  if (targetType === "Department") {
    return { departmentOwnerId: departmentId ?? "00000000-0000-0000-0000-000000000000" };
  }

  return { currentLocation: targetValue };
}

async function serializeAudit(auditId: string) {
  const audit = await prisma.auditCycle.findUnique({
    where: { id: auditId },
    include: {
      department: true,
      assignments: { include: { user: true } },
      records: { include: { asset: true } },
    },
  });

  if (!audit) return null;

  const scopedAssets = await prisma.asset.findMany({
    where: {
      deletedAt: null,
      ...scopedAssetWhere(
        audit.scopeType === "DEPARTMENT" ? "Department" : "Location",
        audit.department?.name ?? audit.location ?? "",
        audit.departmentId ?? undefined
      ),
    },
    orderBy: { assetTag: "asc" },
  });
  const recordByAssetId = new Map(audit.records.map((record) => [record.assetId, record]));
  const checklistAssets =
    scopedAssets.length > 0
      ? scopedAssets
      : audit.records.map((record) => record.asset);
  const completedRecords = audit.records.length;
  const progress =
    audit.status === "CLOSED"
      ? 100
      : checklistAssets.length
        ? Math.round((completedRecords / checklistAssets.length) * 100)
        : 0;

  return {
    id: audit.id.slice(0, 8).toUpperCase(),
    dbId: audit.id,
    scope: audit.name,
    targetType: audit.scopeType === "DEPARTMENT" ? "Department" : "Location",
    targetValue: audit.department?.name ?? audit.location ?? audit.scopeType,
    startDate: formatDate(audit.startDate),
    endDate: formatDate(audit.endDate),
    auditors: audit.assignments.map((assignment) => assignment.user.name),
    status: statusToUi[audit.status] ?? "Draft",
    progress,
    checklist: checklistAssets.map((asset) => {
      const record = recordByAssetId.get(asset.id);

      return {
        tag: asset.assetTag,
        name: asset.name,
        verifyState: record ? recordToUi[record.status] ?? "Verified" : "Verified",
        notes: record?.remarks ?? "",
      };
    }),
  };
}

export async function GET() {
  try {
    const [audits, departments, users, assets] = await Promise.all([
      prisma.auditCycle.findMany({
        where: { deletedAt: null },
        include: {
          department: true,
          assignments: { include: { user: true } },
          records: { include: { asset: true } },
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.department.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
      prisma.user.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
      prisma.asset.findMany({ where: { deletedAt: null }, select: { currentLocation: true } }),
    ]);

    const locations = Array.from(
      new Set(assets.map((asset) => asset.currentLocation).filter(Boolean) as string[])
    );

    return NextResponse.json({
      audits: (await Promise.all(audits.map((audit) => serializeAudit(audit.id)))).filter(Boolean),
      departments: departments.map((department) => department.name),
      locations,
      auditors: users.map((user) => user.name),
    });
  } catch (error) {
    console.error("Failed to load audits", error);
    return NextResponse.json({ message: "Failed to load audits" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetType = String(body.targetType ?? "Location");
    const targetValue = String(body.targetValue ?? "");
    const department =
      targetType === "Department"
        ? await prisma.department.findFirst({ where: { name: targetValue, deletedAt: null } })
        : null;
    const auditor = await prisma.user.findFirst({
      where: { name: String(body.assignedAuditor ?? ""), deletedAt: null },
    });

    const audit = await prisma.auditCycle.create({
      data: {
        name: String(body.scope ?? "").trim(),
        scopeType: targetType === "Department" ? "DEPARTMENT" : "LOCATION",
        departmentId: department?.id,
        location: targetType === "Location" ? targetValue : null,
        startDate: new Date(String(body.startDate)),
        endDate: new Date(String(body.endDate)),
        status: "DRAFT",
        assignments: auditor
          ? {
              create: {
                userId: auditor.id,
                assignedById: auditor.id,
                isLeadAuditor: true,
              },
            }
          : undefined,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "AUDIT_CYCLE_CREATED",
        module: "AUDIT",
        entityType: "AUDIT_CYCLE",
        entityId: audit.id,
      },
    });

    const serialized = await serializeAudit(audit.id);
    return NextResponse.json({ audit: serialized }, { status: 201 });
  } catch (error) {
    console.error("Failed to create audit", error);
    return NextResponse.json({ message: "Failed to create audit" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const auditId = String(body.auditId ?? "");

    if (body.action === "close") {
      await prisma.auditCycle.update({
        where: { id: auditId },
        data: { status: "CLOSED", closedAt: new Date() },
      });
    } else {
      const asset = await prisma.asset.findUnique({ where: { assetTag: String(body.assetTag ?? "") } });
      if (!asset) return NextResponse.json({ message: "Audit asset was not found" }, { status: 404 });

      await prisma.auditCycle.update({
        where: { id: auditId },
        data: { status: "IN_PROGRESS" },
      });
      await prisma.auditRecord.upsert({
        where: { auditCycleId_assetId: { auditCycleId: auditId, assetId: asset.id } },
        update: {
          status: recordToDb[String(body.verifyState ?? "Verified")] ?? "VERIFIED",
          remarks: String(body.notes ?? ""),
        },
        create: {
          auditCycleId: auditId,
          assetId: asset.id,
          status: recordToDb[String(body.verifyState ?? "Verified")] ?? "VERIFIED",
          remarks: String(body.notes ?? ""),
        },
      });
    }

    const serialized = await serializeAudit(auditId);
    return NextResponse.json({ audit: serialized });
  } catch (error) {
    console.error("Failed to update audit", error);
    return NextResponse.json({ message: "Failed to update audit" }, { status: 500 });
  }
}
