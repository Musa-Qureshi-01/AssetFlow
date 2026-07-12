import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

export const AUTH_COOKIE_NAME = "assetflow_session";

const roleToUi: Record<UserRole, "Admin" | "AssetManager" | "Head" | "Employee"> = {
  ADMIN: "Admin",
  ASSET_MANAGER: "AssetManager",
  DEPARTMENT_HEAD: "Head",
  EMPLOYEE: "Employee",
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "AssetManager" | "Head" | "Employee";
  isEmailVerified: boolean;
};

type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
};

function authSecret() {
  return process.env.JWT_ACCESS_SECRET || process.env.NEXTAUTH_SECRET || "assetflow-local-dev-secret";
}

export function createSessionToken(input: AuthTokenPayload) {
  return jwt.sign(input, authSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token?: string): SessionUser | null {
  if (!token) return null;

  try {
    const payload = jwt.verify(token, authSecret()) as AuthTokenPayload;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: roleToUi[payload.role] ?? "Employee",
      isEmailVerified: payload.emailVerified,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
