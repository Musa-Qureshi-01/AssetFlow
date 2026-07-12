import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
} from "@/lib/auth-session";

function publicUser(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt || user.status !== "ACTIVE") {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        actorId: user.id,
        action: "USER_LOGGED_IN",
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

    const response = NextResponse.json({
      message: "Login successful",
      accessToken: token,
      user: publicUser(user),
    });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (error) {
    console.error("Failed to login user", error);
    return NextResponse.json({ message: "Failed to login user" }, { status: 500 });
  }
}
