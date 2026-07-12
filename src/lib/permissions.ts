/**
 * Centralized RBAC permission configuration for Odoo Asset.
 * All role checks, route guards, and capability flags live here.
 * Import this instead of writing scattered `role === "Admin"` checks.
 */

export type AppRole = "Admin" | "AssetManager" | "Head" | "Employee";

// ─── Route Access Matrix ──────────────────────────────────────────────────────

/** Routes that every authenticated user may access */
const PUBLIC_DASHBOARD_ROUTES = [
  "/dashboard",
  "/dashboard/profile",
];

/** Route → allowed roles mapping. Unlisted routes fall back to PUBLIC_DASHBOARD_ROUTES logic. */
const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  "/dashboard":                 ["Admin", "AssetManager", "Head", "Employee"],
  "/dashboard/profile":         ["Admin", "AssetManager", "Head", "Employee"],
  "/dashboard/bookings":        ["Admin", "AssetManager", "Head", "Employee"],
  "/dashboard/allocations":     ["Admin", "AssetManager", "Head", "Employee"],
  "/dashboard/maintenance":     ["Admin", "AssetManager", "Employee"],
  "/dashboard/assets":          ["Admin", "AssetManager"],
  "/dashboard/audits":          ["Admin", "AssetManager"],
  "/dashboard/analytics":       ["Admin", "AssetManager", "Head"],
  "/dashboard/organization":    ["Admin"],
};

/**
 * Returns true if the given role is allowed to access the given pathname.
 * Performs prefix matching so nested routes (e.g. /dashboard/assets/123)
 * inherit the parent route's permission.
 */
export function canAccessRoute(role: AppRole, pathname: string): boolean {
  // Find the most specific matching route
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(route + "/"))
    .sort((a, b) => b.length - a.length)[0]; // longest match wins

  if (!matchedRoute) {
    // Unknown dashboard sub-route — deny by default (except for public routes)
    return PUBLIC_DASHBOARD_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    );
  }

  return ROUTE_PERMISSIONS[matchedRoute].includes(role);
}

// ─── Capability Flags ─────────────────────────────────────────────────────────

/** Only ADMIN and DEPARTMENT_HEAD can compose/send notifications */
export function canSendNotification(role: AppRole): boolean {
  return role === "Admin" || role === "Head";
}

/** Only ADMIN can access Organization Setup */
export function canManageOrganization(role: AppRole): boolean {
  return role === "Admin";
}

/** ADMIN and ASSET_MANAGER can register/allocate assets */
export function canManageAssets(role: AppRole): boolean {
  return role === "Admin" || role === "AssetManager";
}

/** ADMIN and ASSET_MANAGER can approve/reject maintenance tickets */
export function canApproveMaintenance(role: AppRole): boolean {
  return role === "Admin" || role === "AssetManager";
}

/** ADMIN and ASSET_MANAGER can create/manage audits */
export function canManageAudits(role: AppRole): boolean {
  return role === "Admin" || role === "AssetManager";
}

/** ADMIN can assign/change user roles */
export function canManageRoles(role: AppRole): boolean {
  return role === "Admin";
}

// ─── Sidebar Navigation ───────────────────────────────────────────────────────

export interface NavLink {
  name: string;
  href: string;
  iconKey: string;
}

const ALL_NAV_LINKS: (NavLink & { roles: AppRole[] })[] = [
  {
    name: "Operations Control",
    href: "/dashboard",
    iconKey: "dashboard",
    roles: ["Admin", "AssetManager", "Head", "Employee"],
  },
  {
    name: "Asset Registry",
    href: "/dashboard/assets",
    iconKey: "package",
    roles: ["Admin", "AssetManager"],
  },
  {
    name: "Bookings & Schedules",
    href: "/dashboard/bookings",
    iconKey: "calendar",
    roles: ["Admin", "AssetManager", "Head", "Employee"],
  },
  {
    name: "Maintenance Logs",
    href: "/dashboard/maintenance",
    iconKey: "wrench",
    roles: ["Admin", "AssetManager", "Employee"],
  },
  {
    name: "Relocation/Transfers",
    href: "/dashboard/allocations",
    iconKey: "arrows",
    roles: ["Admin", "AssetManager", "Head", "Employee"],
  },
  {
    name: "Audit Cycles",
    href: "/dashboard/audits",
    iconKey: "clipboard",
    roles: ["Admin", "AssetManager"],
  },
  {
    name: "Reports & Analytics",
    href: "/dashboard/analytics",
    iconKey: "chart",
    roles: ["Admin", "AssetManager", "Head"],
  },
  {
    name: "Organization Setup",
    href: "/dashboard/organization",
    iconKey: "layers",
    roles: ["Admin"],
  },
];

/** Returns filtered nav links for the given role */
export function getNavLinksForRole(role: AppRole): NavLink[] {
  return ALL_NAV_LINKS
    .filter((link) => link.roles.includes(role))
    .map(({ name, href, iconKey }) => ({ name, href, iconKey }));
}

// ─── Role Display Helpers ─────────────────────────────────────────────────────

export const ROLE_LABELS: Record<AppRole, string> = {
  Admin:        "Sys_Admin",
  AssetManager: "Asset_Mgr",
  Head:         "Dept_Head",
  Employee:     "Employee",
};

export function getRoleLabel(role: AppRole): string {
  return ROLE_LABELS[role] ?? "Employee";
}
