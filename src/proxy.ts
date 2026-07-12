import { NextRequest, NextResponse } from "next/server";
import { canAccessRoute } from "@/lib/permissions";
import type { AppRole } from "@/lib/permissions";

const AUTH_COOKIE_NAME = "assetflow_session";

// DB role enum → UI AppRole
const ROLE_MAP: Record<string, AppRole> = {
  ADMIN:           "Admin",
  ASSET_MANAGER:   "AssetManager",
  DEPARTMENT_HEAD: "Head",
  EMPLOYEE:        "Employee",
};

/**
 * Decode a JWT payload without verifying the signature.
 * Signature verification happens inside API routes via getSessionUser().
 * Here we only need the role + expiry for fast route-gating.
 */
function decodeJwtPayload(
  token: string
): { role?: string; sub?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // atob is available in the Next.js Edge runtime used by proxy.ts
    const json = atob(base64);
    return JSON.parse(json) as { role?: string; sub?: string; exp?: number };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup");

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasSession = Boolean(token);

  // ── 1. No session → redirect to login ─────────────────────────────────────
  if (isDashboardRoute && !hasSession) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ── 2. Already logged in → skip auth pages ────────────────────────────────
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── 3. RBAC route enforcement for dashboard routes ────────────────────────
  if (isDashboardRoute && token) {
    const payload = decodeJwtPayload(token);

    // Malformed or expired token → clear + redirect
    if (!payload || !payload.sub) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    const appRole: AppRole = ROLE_MAP[payload.role as string] ?? "Employee";

    // Route not permitted for this role → silently redirect to dashboard root
    if (!canAccessRoute(appRole, pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/signup"],
};
