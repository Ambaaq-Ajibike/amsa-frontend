import { hasAnyRole, ROLES } from "@/lib/permissions"

/**
 * Get the appropriate redirect path based on user permissions and roles
 * @returns The path to redirect to
 */
export function getRedirectPath(): string {
  // Check if user has admin or tajneed roles for dashboard access
  const hasAdminOrTajneedRole = hasAnyRole([ROLES.ADMIN, ROLES.TAJNEED])
  
  if (hasAdminOrTajneedRole) {
    // Redirect to dashboard for admin/tajneed users
    return "/dashboard"
  } else {
    // Redirect to profile page for nominal users
    return "/settings"
  }
}
