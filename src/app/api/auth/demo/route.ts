import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
} from "@/lib/auth-session";

// ── Demo accounts — development only ─────────────────────────────────────────
const DEMO_ACCOUNTS = {
  admin: {
    sub:           "demo-admin-001",
    email:         "admin@odooasset.dev",
    name:          "Musa (Admin)",
    role:          "ADMIN"  as const,
    emailVerified: true,
  },
  asset_manager: {
    sub:           "demo-am-002",
    email:         "assetmgr@odooasset.dev",
    name:          "Elena Rossi",
    role:          "ASSET_MANAGER" as const,
    emailVerified: true,
  },
  dept_head: {
    sub:           "demo-head-003",
    email:         "head@odooasset.dev",
    name:          "Rajesh Kumar",
    role:          "DEPARTMENT_HEAD" as const,
    emailVerified: true,
  },
  employee: {
    sub:           "demo-emp-004",
    email:         "employee@odooasset.dev",
    name:          "Chloe Dubois",
    role:          "EMPLOYEE" as const,
    emailVerified: true,
  },
};

type DemoKey = keyof typeof DEMO_ACCOUNTS;

export async function POST(request: Request) {
  // ── Guard: only available in development ──────────────────────────────────
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Not available in production" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const roleKey = String(body.role ?? "admin").toLowerCase() as DemoKey;
  const account = DEMO_ACCOUNTS[roleKey] ?? DEMO_ACCOUNTS.admin;

  const token = createSessionToken(account);

  const response = NextResponse.json({
    message: `Demo session started as ${account.name}`,
    user: {
      id:              account.sub,
      email:           account.email,
      name:            account.name,
      role:            account.role === "ADMIN" ? "Admin"
                     : account.role === "ASSET_MANAGER" ? "AssetManager"
                     : account.role === "DEPARTMENT_HEAD" ? "Head"
                     : "Employee",
      isEmailVerified: account.emailVerified,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
  return response;
}
