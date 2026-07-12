import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function categoryCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

function roleToUi(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "DEPARTMENT_HEAD") return "Head";
  if (role === "ASSET_MANAGER") return "AssetManager";
  return "Employee";
}

export async function GET() {
  try {
    const [departments, categories, employees] = await Promise.all([
      prisma.department.findMany({
        where: { deletedAt: null },
        include: { head: true, parentDepartment: true },
        orderBy: { name: "asc" },
      }),
      prisma.assetCategory.findMany({
        where: { deletedAt: null },
        include: { _count: { select: { assets: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: { deletedAt: null },
        include: { department: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      departments: departments.map((department) => ({
        code: department.code,
        name: department.name,
        head: department.head?.name ?? "None Assigned",
        parent: department.parentDepartment?.name ?? "None (Root Node)",
        status: department.status === "ACTIVE" ? "ACTIVE" : "DEACTIVATED",
      })),
      categories: categories.map((category) => ({
        name: category.name,
        description: category.description ?? "",
        itemCount: category._count.assets,
        fields: Array.isArray(category.metadataSchema) ? category.metadataSchema : [],
      })),
      employees: employees.map((employee) => ({
        id: employee.employeeCode ?? employee.id.slice(0, 8).toUpperCase(),
        dbId: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department?.name ?? "Unassigned",
        role: roleToUi(employee.role),
        status: employee.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      })),
    });
  } catch (error) {
    console.error("Failed to load organization", error);
    return NextResponse.json({ message: "Failed to load organization" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = String(body.type ?? "");

    if (type === "department") {
      const department = await prisma.department.upsert({
        where: { code: String(body.code ?? "").toUpperCase() },
        update: {
          name: String(body.name ?? ""),
          status: body.status === "DEACTIVATED" ? "INACTIVE" : "ACTIVE",
        },
        create: {
          code: String(body.code ?? "").toUpperCase(),
          name: String(body.name ?? ""),
          status: body.status === "DEACTIVATED" ? "INACTIVE" : "ACTIVE",
        },
      });

      return NextResponse.json({
        department: {
          code: department.code,
          name: department.name,
          head: "None Assigned",
          parent: "None (Root Node)",
          status: department.status === "ACTIVE" ? "ACTIVE" : "DEACTIVATED",
        },
      });
    }

    if (type === "category") {
      const name = String(body.name ?? "");
      const category = await prisma.assetCategory.upsert({
        where: { code: categoryCode(name) },
        update: {
          name,
          description: String(body.description ?? ""),
          metadataSchema: body.fields ?? [],
        },
        create: {
          code: categoryCode(name),
          name,
          description: String(body.description ?? ""),
          metadataSchema: body.fields ?? [],
        },
      });

      return NextResponse.json({
        category: {
          name: category.name,
          description: category.description ?? "",
          itemCount: 0,
          fields: body.fields ?? [],
        },
      });
    }

    return NextResponse.json({ message: "Unsupported organization operation" }, { status: 400 });
  } catch (error) {
    console.error("Failed to save organization", error);
    return NextResponse.json({ message: "Failed to save organization" }, { status: 500 });
  }
}
