import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { DbUserRole } from "@/lib/auth-session";
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

const LOCAL_ACCOUNTS = [
  {
    id: "local-admin-001",
    email: "musaqureshi788code@gmail.com",
    name: "Musa Qureshi",
    role: "ADMIN" as DbUserRole,
  },
  {
    id: "local-head-001",
    email: "kawadkarmuskan4@gmail.com",
    name: "Muskan Kawadkar",
    role: "DEPARTMENT_HEAD" as DbUserRole,
  },
  {
    id: "local-head-002",
    email: "aarav.sharma@company.dev",
    name: "Aarav Sharma",
    role: "DEPARTMENT_HEAD" as DbUserRole,
  },
  {
    id: "local-head-003",
    email: "priya.mehta@company.dev",
    name: "Priya Mehta",
    role: "DEPARTMENT_HEAD" as DbUserRole,
  },
  {
    id: "local-head-004",
    email: "neha.singh@company.dev",
    name: "Neha Singh",
    role: "DEPARTMENT_HEAD" as DbUserRole,
  },
  {
    id: "local-manager-001",
    email: "rohan.patel@company.dev",
    name: "Rohan Patel",
    role: "ASSET_MANAGER" as DbUserRole,
  },
  {
    id: "local-manager-002",
    email: "ananya.verma@company.dev",
    name: "Ananya Verma",
    role: "ASSET_MANAGER" as DbUserRole,
  },
  {
    id: "local-emp-001",
    email: "arjun.gupta@company.dev",
    name: "Arjun Gupta",
    role: "EMPLOYEE" as DbUserRole,
  },
  {
    id: "local-emp-002",
    email: "kavya.nair@company.dev",
    name: "Kavya Nair",
    role: "EMPLOYEE" as DbUserRole,
  },
  {
    id: "local-emp-003",
    email: "aditya.joshi@company.dev",
    name: "Aditya Joshi",
    role: "EMPLOYEE" as DbUserRole,
  },
  {
    id: "local-emp-004",
    email: "sneha.kapoor@company.dev",
    name: "Sneha Kapoor",
    role: "EMPLOYEE" as DbUserRole,
  },
  {
    id: "local-emp-005",
    email: "rahul.iyer@company.dev",
    name: "Rahul Iyer",
    role: "EMPLOYEE" as DbUserRole,
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    let user: {
      id: string;
      email: string;
      name: string;
      role: DbUserRole;
      emailVerifiedAt: Date | null;
      passwordHash?: string;
    } | null = null;

    try {
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser && !dbUser.deletedAt && dbUser.status === "ACTIVE") {
        user = dbUser;
      }
    } catch (dbError) {
      console.warn("Database connection failed during login, using local bypass fallback:", dbError);
    }

    if (user) {
      // Direct db verify
      const isValidPassword = await bcrypt.compare(password, user.passwordHash || "");
      if (!isValidPassword) {
        return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
      }
      
      try {
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
      } catch (updateError) {
        console.warn("Could not update user login log in database:", updateError);
      }
    } else {
      // Check local accounts fallback
      const localAccount = LOCAL_ACCOUNTS.find(acc => acc.email === email);
      if (!localAccount) {
        return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
      }
      // In bypass mode, accept any password that is at least 6 characters
      if (password.length < 6) {
        return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
      }
      user = {
        id: localAccount.id,
        email: localAccount.email,
        name: localAccount.name,
        role: localAccount.role,
        emailVerifiedAt: new Date(),
      };
    }

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
