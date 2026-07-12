import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const priorityToDb: Record<string, "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"> = {
  Standard: "LOW",
  Medium: "MEDIUM",
  Urgent: "HIGH",
  Critical: "CRITICAL",
};

const priorityToUi: Record<string, string> = {
  LOW: "Standard",
  MEDIUM: "Standard",
  HIGH: "Urgent",
  CRITICAL: "Critical",
};

const stageToUi: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  TECHNICIAN_ASSIGNED: "Tech Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Resolved",
};

function timeLabel(date: Date) {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just logged";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function serializeTicket(request: Awaited<ReturnType<typeof getRequests>>[number]) {
  return {
    id: request.id.slice(0, 8).toUpperCase(),
    dbId: request.id,
    tag: request.asset.assetTag,
    assetName: request.asset.name,
    issue: request.description,
    priority: priorityToUi[request.priority] ?? "Standard",
    requester: request.requestedBy.name,
    loggedTime: timeLabel(request.createdAt),
    stage: stageToUi[request.status] ?? "Pending",
    technician: request.technician?.name,
    notes: request.resolutionNotes ?? undefined,
    history: [
      `Logged by ${request.requestedBy.name} // ${timeLabel(request.createdAt)}`,
      ...(request.technician ? [`Technician ${request.technician.name} assigned`] : []),
      ...(request.resolutionNotes ? [`Resolution: ${request.resolutionNotes}`] : []),
    ],
  };
}

function getRequests() {
  return prisma.maintenanceRequest.findMany({
    where: { deletedAt: null },
    include: { asset: true, requestedBy: true, technician: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function GET() {
  try {
    const [requests, assets] = await Promise.all([
      getRequests(),
      prisma.asset.findMany({ where: { deletedAt: null }, orderBy: { assetTag: "asc" } }),
    ]);

    return NextResponse.json({
      tickets: requests.map(serializeTicket),
      assets: assets.map((asset) => ({ tag: asset.assetTag, name: asset.name })),
    });
  } catch (error) {
    console.error("Failed to load maintenance", error);
    return NextResponse.json({ message: "Failed to load maintenance" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [asset, user] = await Promise.all([
      prisma.asset.findUnique({ where: { assetTag: String(body.assetTag ?? "") } }),
      prisma.user.findFirst({ where: { deletedAt: null } }),
    ]);

    if (!asset || !user) {
      return NextResponse.json({ message: "A target asset and requester are required" }, { status: 400 });
    }

    const ticket = await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.id,
        requestedById: user.id,
        description: String(body.issue ?? ""),
        priority: priorityToDb[String(body.priority ?? "Standard")] ?? "LOW",
      },
      include: { asset: true, requestedBy: true, technician: true },
    });

    await prisma.activityLog.create({
      data: {
        action: "MAINTENANCE_REQUESTED",
        module: "MAINTENANCE",
        entityType: "MAINTENANCE_REQUEST",
        entityId: ticket.id,
      },
    });

    return NextResponse.json({ ticket: serializeTicket(ticket) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create maintenance", error);
    return NextResponse.json({ message: "Failed to create maintenance" }, { status: 500 });
  }
}
