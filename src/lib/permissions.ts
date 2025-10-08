import { useAuthStore } from '@/stores/authStore'

/**
 * Permission constants
 */
export const PERMISSIONS = {
  CAN_VIEW_USERS: 'CanViewUsers',
  CAN_ASSIGN_ROLE: 'CanAssignRole',
  CAN_CREATE_EVENT: 'CanCreateEvent',
  CAN_CHECK_IN_EVENT: 'CanCheckInEvent',
} as const

/**
 * Role constants
 */
export const ROLES = {
  ADMIN: 'Admin',
  TAJNEED: 'Tajneed',
} as const

/**
 * Check if user has a specific permission
 */
export function hasPermission(permission: string): boolean {
  const user = useAuthStore.getState().auth.user
  return user?.permissions?.includes(permission) ?? false
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(permissions: string[]): boolean {
  const user = useAuthStore.getState().auth.user
  if (!user?.permissions) return false
  return permissions.some(permission => user.permissions.includes(permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(permissions: string[]): boolean {
  const user = useAuthStore.getState().auth.user
  if (!user?.permissions) return false
  return permissions.every(permission => user.permissions.includes(permission))
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: string): boolean {
  const user = useAuthStore.getState().auth.user
  return user?.roles?.includes(role) ?? false
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: string[]): boolean {
  const user = useAuthStore.getState().auth.user
  if (!user?.roles) return false
  return roles.some(role => user.roles.includes(role))
}

/**
 * Hook to get current user permissions
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.auth.user)
  
  return {
    permissions: user?.permissions ?? [],
    roles: user?.roles ?? [],
    hasPermission: (permission: string) => hasPermission(permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(permissions),
    hasRole: (role: string) => hasRole(role),
    hasAnyRole: (roles: string[]) => hasAnyRole(roles),
  }
}
