import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { DbUserRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
} from "@/lib/auth-session";

const roleToDb: Record<string, DbUserRole> = {
  Admin: "ADMIN",
  AssetManager: "ASSET_MANAGER",
  Head: "DEPARTMENT_HEAD",
  Employee: "EMPLOYEE",
};

function normalizeEmployeeCode(code: string) {
  return code.trim().toUpperCase();
}

function publicUser(user: {
  id: string;
  email: string;
  name: string;
  role: DbUserRole;
  emailVerifiedAt: Date | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role:
      user.role === "ADMIN"
        ? "Admin"
        : user.role === "ASSET_MANAGER"
          ? "AssetManager"
          : user.role === "DEPARTMENT_HEAD"
            ? "Head"
            : "Employee",
    isEmailVerified: Boolean(user.emailVerifiedAt),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const employeeCode = normalizeEmployeeCode(String(body.employeeId ?? body.employeeCode ?? ""));
    const role = roleToDb[String(body.role ?? "Employee")] ?? "EMPLOYEE";

    if (!name || !email || !password || !employeeCode) {
      return NextResponse.json({ message: "Name, email, employee ID, and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { employeeCode }],
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Email or employee ID is already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        employeeCode,
        passwordHash,
        role,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        actorId: user.id,
        action: "USER_REGISTERED",
        module: "AUTH",
        entityType: "USER",
        entityId: user.id,
      },
    });

    const token = createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: Boolean(user.emailVerifiedAt),
    });

    const response = NextResponse.json(
      {
        message: "User registered",
        accessToken: token,
        user: publicUser(user),
      },
      { status: 201 }
    );
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (error) {
    console.error("Failed to register user", error);
    return NextResponse.json({ message: "Failed to register user" }, { status: 500 });
  }
}
