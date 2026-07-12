import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const conditionToDb = {
  Excellent: "NEW",
  Good: "GOOD",
  Fair: "FAIR",
  Poor: "POOR",
} as const;

const dbConditionToUi: Record<string, string> = {
  NEW: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  DAMAGED: "Poor",
  REQUIRES_SERVICE: "Fair",
};

const dbStatusToUi: Record<string, string> = {
  AVAILABLE: "Available",
  ALLOCATED: "Allocated",
  RESERVED: "Reserved",
  UNDER_MAINTENANCE: "Under Maintenance",
  LOST: "Lost",
  RETIRED: "Retired",
  DISPOSED: "Disposed",
};

function categoryCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

function formatDate(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function serializeAsset(asset: Prisma.AssetGetPayload<{
  include: {
    category: true;
    departmentOwner: true;
    allocations: {
      include: {
        targetEmployee: true;
        targetDepartment: true;
      };
      orderBy: { requestedAt: "desc" };
    };
    maintenanceRequests: {
      orderBy: { createdAt: "desc" };
    };
  };
}>) {
  const activeAllocation = asset.allocations.find((allocation) =>
    ["APPROVED", "REASSIGNED"].includes(allocation.status)
  );

  return {
    tag: asset.assetTag,
    name: asset.name,
    category: asset.category.name,
    status: dbStatusToUi[asset.currentStatus] ?? asset.currentStatus,
    condition: dbConditionToUi[asset.condition] ?? "Good",
    department: asset.departmentOwner?.name ?? activeAllocation?.targetDepartment?.name ?? "Unassigned",
    holder:
      activeAllocation?.targetEmployee?.name ??
      activeAllocation?.targetDepartment?.name ??
      "None Assigned",
    location: asset.currentLocation ?? "Unassigned",
    serial: asset.serialNumber ?? "",
    acqDate: formatDate(asset.acquisitionDate),
    acqCost: Number(asset.acquisitionCost ?? 0),
    bookable: asset.sharedResource,
    allocationHistory: asset.allocations.map((allocation) => ({
      date: formatDate(allocation.allocatedAt ?? allocation.requestedAt),
      holder:
        allocation.targetEmployee?.name ??
        allocation.targetDepartment?.name ??
        allocation.targetType,
      action: allocation.actualReturnDate ? "RETURNED" : "DISPATCHED",
      location: asset.currentLocation ?? "Unassigned",
    })),
    maintenanceHistory: asset.maintenanceRequests.map((request) => ({
      date: formatDate(request.createdAt),
      issue: request.description,
      priority:
        request.priority === "CRITICAL"
          ? "Critical"
          : request.priority === "HIGH"
            ? "Urgent"
            : "Standard",
      status:
        request.status === "RESOLVED"
          ? "RESOLVED"
          : request.status === "IN_PROGRESS"
            ? "IN INSPECTION"
            : "QUEUED",
    })),
  };
}

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        departmentOwner: true,
        allocations: {
          where: { deletedAt: null },
          include: { targetEmployee: true, targetDepartment: true },
          orderBy: { requestedAt: "desc" },
        },
        maintenanceRequests: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assets: assets.map(serializeAsset) });
  } catch (error) {
    console.error("Failed to load assets", error);
    return NextResponse.json({ message: "Failed to load assets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const categoryName = String(body.category ?? "").trim();
    const serial = String(body.serial ?? "").trim().toUpperCase();
    const location = String(body.location ?? "").trim();
    const acquisitionDate = String(body.acquisitionDate ?? "");
    const acquisitionCost = Number(body.acquisitionCost);
    const condition = String(body.condition ?? "Good") as keyof typeof conditionToDb;

    if (!name || !categoryName || !serial || !location || !acquisitionDate || Number.isNaN(acquisitionCost)) {
      return NextResponse.json({ message: "Missing required asset fields" }, { status: 400 });
    }

    const category = await prisma.assetCategory.upsert({
      where: { code: categoryCode(categoryName) || "UNCATEGORIZED" },
      update: { name: categoryName },
      create: {
        code: categoryCode(categoryName) || "UNCATEGORIZED",
        name: categoryName,
      },
    });

    const count = await prisma.asset.count();
    const asset = await prisma.asset.create({
      data: {
        assetTag: `AF-${String(count + 1).padStart(4, "0")}`,
        name,
        categoryId: category.id,
        serialNumber: serial,
        acquisitionDate: new Date(acquisitionDate),
        acquisitionCost: new Prisma.Decimal(acquisitionCost),
        condition: conditionToDb[condition] ?? "GOOD",
        currentStatus: "AVAILABLE",
        currentLocation: location,
        sharedResource: Boolean(body.bookable),
      },
      include: {
        category: true,
        departmentOwner: true,
        allocations: {
          include: { targetEmployee: true, targetDepartment: true },
          orderBy: { requestedAt: "desc" },
        },
        maintenanceRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "ASSET_REGISTERED",
        module: "ASSET",
        entityType: "ASSET",
        entityId: asset.id,
        newValue: {
          assetTag: asset.assetTag,
          name: asset.name,
          location: asset.currentLocation,
        },
      },
    });

    return NextResponse.json({ asset: serializeAsset(asset) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset", error);
    return NextResponse.json({ message: "Failed to create asset" }, { status: 500 });
  }
}
