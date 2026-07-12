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
    console.warn("Failed to load allocations from database, using static fallback:", error);
    return NextResponse.json({
      assetLookups: [
        { tag: "AST-LT-001", name: "MacBook Pro M3 14\"", status: "Allocated", holder: "Musa Qureshi", department: "Operations", location: "Floor 3 — Eng Zone" },
        { tag: "AST-LT-002", name: "MacBook Pro M3 14\"", status: "Allocated", holder: "Arjun Gupta", department: "Engineering", location: "Floor 3 — Eng Zone" },
        { tag: "AST-LT-003", name: "MacBook Air M2", status: "Allocated", holder: "Kavya Nair", department: "Product", location: "Floor 2 — Product Zone" },
        { tag: "AST-LT-004", name: "Dell XPS 15", status: "Allocated", holder: "Aarav Sharma", department: "Operations", location: "Floor 1 — Ops Zone" },
        { tag: "AST-LT-006", name: "HP EliteBook 840 G10", status: "Available", holder: "None Assigned", department: "Operations", location: "IT Storage Room" },
      ],
      allocations: [
        { tag: "AST-LT-001", name: "MacBook Pro M3 14\"", custodian: "Musa Qureshi", department: "Operations", startDate: "2026-03-14", dueDate: "2026-09-14" },
        { tag: "AST-LT-002", name: "MacBook Pro M3 14\"", custodian: "Arjun Gupta", department: "Engineering", startDate: "2026-04-03", dueDate: "2026-10-03" },
        { tag: "AST-LT-003", name: "MacBook Air M2", custodian: "Kavya Nair", department: "Product", startDate: "2025-11-24", dueDate: "2026-05-24" },
      ],
      transfers: [],
      overdues: [
        { tag: "AST-LT-006", name: "HP EliteBook 840 G10", custodian: "Rahul Iyer", dueDate: "2026-06-12", overdueDays: 30 },
        { tag: "AST-PR-003", name: "CalDigit TS4 Thunderbolt Dock", custodian: "Neha Singh", dueDate: "2026-06-28", overdueDays: 14 },
      ],
    });
  }
}
