import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function timeLabel(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [
      availableAssets,
      allocatedAssets,
      maintenanceToday,
      criticalMaintenance,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
      recentActivities,
    ] = await Promise.all([
      prisma.asset.count({ where: { deletedAt: null, currentStatus: "AVAILABLE" } }),
      prisma.asset.count({ where: { deletedAt: null, currentStatus: "ALLOCATED" } }),
      prisma.maintenanceRequest.count({
        where: { deletedAt: null, createdAt: { gte: todayStart, lt: todayEnd } },
      }),
      prisma.maintenanceRequest.count({
        where: { deletedAt: null, priority: "CRITICAL", status: { not: "RESOLVED" } },
      }),
      prisma.resourceBooking.count({
        where: { deletedAt: null, status: { in: ["UPCOMING", "ONGOING"] } },
      }),
      prisma.assetAllocation.count({
        where: { deletedAt: null, status: { in: ["REQUESTED", "APPROVED", "REASSIGNED"] } },
      }),
      prisma.assetAllocation.count({
        where: {
          deletedAt: null,
          actualReturnDate: null,
          expectedReturnDate: { gte: now },
          status: { in: ["APPROVED", "REASSIGNED"] },
        },
      }),
      prisma.assetAllocation.findMany({
        where: {
          deletedAt: null,
          actualReturnDate: null,
          expectedReturnDate: { lt: now },
          status: { in: ["APPROVED", "REASSIGNED"] },
        },
        include: {
          asset: true,
          targetEmployee: true,
          targetDepartment: true,
        },
        orderBy: { expectedReturnDate: "asc" },
        take: 5,
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    return NextResponse.json({
      metrics: {
        availableAssets,
        allocatedAssets,
        maintenanceToday,
        criticalMaintenance,
        activeBookings,
        pendingTransfers,
        upcomingReturns,
        overdueReturns: overdueReturns.length,
      },
      overdueReturns: overdueReturns.map((item) => ({
        id: item.asset.assetTag,
        name: item.asset.name,
        overdueDays: item.expectedReturnDate
          ? Math.max(1, Math.ceil((now.getTime() - item.expectedReturnDate.getTime()) / 86400000))
          : 0,
        custodian: item.targetEmployee?.name ?? item.targetDepartment?.name ?? "Unassigned",
        zone: item.asset.currentLocation ?? "Unassigned",
        severity: "high",
      })),
      activities: recentActivities.map((activity) => ({
        time: timeLabel(activity.createdAt),
        type: activity.module.toLowerCase(),
        desc: `${activity.action.replaceAll("_", " ")} ${activity.entityType.toLowerCase()}`,
        asset: activity.entityId?.slice(0, 8).toUpperCase() ?? "SYSTEM",
        operator: activity.actorId?.slice(0, 8).toUpperCase() ?? "System",
        status: "COMPLETED",
        statusColor: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
      })),
    });
  } catch (error) {
    console.error("Failed to load dashboard", error);
    return NextResponse.json({ message: "Failed to load dashboard" }, { status: 500 });
  }
}
