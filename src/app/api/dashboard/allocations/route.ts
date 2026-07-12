import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatDate(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function statusToUi(status: string) {
  const map: Record<string, string> = {
    AVAILABLE: "Available",
    ALLOCATED: "Allocated",
    RESERVED: "Reserved",
    UNDER_MAINTENANCE: "Under Maintenance",
  };
  return map[status] ?? "Available";
}

export async function GET() {
  try {
    const now = new Date();
    const [assets, allocations] = await Promise.all([
      prisma.asset.findMany({
        where: { deletedAt: null },
        include: { departmentOwner: true },
        orderBy: { assetTag: "asc" },
      }),
      prisma.assetAllocation.findMany({
        where: { deletedAt: null, status: { in: ["APPROVED", "REASSIGNED"] }, actualReturnDate: null },
        include: { asset: true, targetEmployee: true, targetDepartment: true },
        orderBy: { allocatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      assetLookups: assets.map((asset) => ({
        tag: asset.assetTag,
        name: asset.name,
        status: statusToUi(asset.currentStatus),
        holder: "None Assigned",
        department: asset.departmentOwner?.name ?? "Unassigned",
        location: asset.currentLocation ?? "Unassigned",
      })),
      allocations: allocations.map((allocation) => ({
        tag: allocation.asset.assetTag,
        name: allocation.asset.name,
        custodian:
          allocation.targetEmployee?.name ??
          allocation.targetDepartment?.name ??
          allocation.targetType,
        department: allocation.targetDepartment?.name ?? "Unassigned",
        startDate: formatDate(allocation.allocatedAt ?? allocation.requestedAt),
        dueDate: formatDate(allocation.expectedReturnDate),
      })),
      transfers: [],
      overdues: allocations
        .filter((allocation) => allocation.expectedReturnDate && allocation.expectedReturnDate < now)
        .map((allocation) => ({
          tag: allocation.asset.assetTag,
          name: allocation.asset.name,
          custodian:
            allocation.targetEmployee?.name ??
            allocation.targetDepartment?.name ??
            allocation.targetType,
          dueDate: formatDate(allocation.expectedReturnDate),
          overdueDays: allocation.expectedReturnDate
            ? Math.max(1, Math.ceil((now.getTime() - allocation.expectedReturnDate.getTime()) / 86400000))
            : 0,
        })),
    });
  } catch (error) {
    console.error("Failed to load allocations", error);
    return NextResponse.json({ message: "Failed to load allocations" }, { status: 500 });
  }
}
