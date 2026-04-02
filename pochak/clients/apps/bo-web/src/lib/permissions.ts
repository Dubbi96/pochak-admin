import type { AdminRole } from "@/stores/auth-store";

/**
 * Route-level RBAC permission map.
 * Keys are route patterns (with wildcard support).
 * Values are arrays of roles allowed to access the route.
 *
 * More specific routes are checked BEFORE wildcard patterns,
 * so specific overrides take precedence.
 */
const SPECIFIC_ROUTE_PERMISSIONS: Record<string, AdminRole[]> = {
  // Teams — specific sub-routes with MEMBER_MANAGER access
  "/teams/elite": ["MASTER_BO", "MEMBER_MANAGER"],
  "/teams/club": ["MASTER_BO", "MEMBER_MANAGER"],
  "/teams/private-hq": ["MASTER_BO", "MEMBER_MANAGER"],
  "/teams/private-branch": ["MASTER_BO", "MEMBER_MANAGER"],
  "/teams/public-org": ["MASTER_BO", "MEMBER_MANAGER"],
  "/teams/associations": ["MASTER_BO", "MEMBER_MANAGER"],

  // Commerce — specific MASTER_BO-only sub-routes
  "/commerce/gift-ball": ["MASTER_BO"],
  "/commerce/inapp-refunds": ["MASTER_BO"],
  "/commerce/season-pass-history": ["MASTER_BO"],
  "/commerce/remaining-points": ["MASTER_BO"],

  // Site — specific MASTER_BO-only sub-routes
  "/site/popups": ["MASTER_BO"],
  "/site/events": ["MASTER_BO"],

  // Reservations — booking sub-route
  "/reservations/booking": ["MASTER_BO", "CONTENT_MANAGER"],
};

export const ROUTE_PERMISSIONS: Record<string, AdminRole[]> = {
  "/operations/*": ["MASTER_BO"],
  "/contents/*": ["MASTER_BO", "CONTENT_MANAGER"],
  "/members/*": ["MASTER_BO", "MEMBER_MANAGER"],
  "/commerce/*": ["MASTER_BO"],
  "/statistics/*": ["MASTER_BO", "CONTENT_MANAGER"],
  "/studio/*": ["MASTER_BO", "CONTENT_MANAGER"],
  "/monitoring/*": ["MASTER_BO"],
  "/equipment/*": ["MASTER_BO"],
  "/venues/*": ["MASTER_BO", "CONTENT_MANAGER"],
  "/reservations/*": ["MASTER_BO", "CONTENT_MANAGER"],
  "/teams/*": ["MASTER_BO", "MEMBER_MANAGER"],
  "/community/*": ["MASTER_BO", "CONTENT_MANAGER"],
  "/competitions/*": ["MASTER_BO", "CONTENT_MANAGER"],
  "/sports/*": ["MASTER_BO", "CONTENT_MANAGER"],
  "/site/*": ["MASTER_BO"],
  "/support/*": ["MASTER_BO", "MEMBER_MANAGER"],
  "/app-management/*": ["MASTER_BO"],
  "/skylife/*": ["MASTER_BO"],
};

/**
 * Check whether a user role has permission to access a given path.
 * Returns true if no matching rule is found (default allow for unprotected routes like dashboard).
 */
export function hasPermission(userRole: string, path: string): boolean {
  // Dashboard is accessible to all authenticated users
  if (path === "/" || path === "") {
    return true;
  }

  // Check specific route permissions first (exact match takes precedence)
  if (SPECIFIC_ROUTE_PERMISSIONS[path]) {
    return SPECIFIC_ROUTE_PERMISSIONS[path].includes(userRole as AdminRole);
  }

  // Then check wildcard patterns
  for (const [pattern, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (matchRoute(pattern, path)) {
      return allowedRoles.includes(userRole as AdminRole);
    }
  }

  // No matching rule found — default allow (unprotected route)
  return true;
}

/**
 * Check if a sidebar menu href matches any restricted route,
 * and whether the user role is allowed.
 */
export function canAccessMenuItem(userRole: string, href: string): boolean {
  return hasPermission(userRole, href);
}

/**
 * Simple wildcard route matching.
 * Supports patterns like "/operations/*" matching "/operations/members".
 */
function matchRoute(pattern: string, path: string): boolean {
  if (pattern === path) return true;

  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -1); // Remove the '*', keep the '/'
    return path.startsWith(prefix) || path === prefix.slice(0, -1);
  }

  return false;
}
