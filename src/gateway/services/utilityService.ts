import { getRequest } from '../apiService'
import type { Permission, PermissionLevel, State, Unit, Statistics } from '../types/api'

export const utilityService = {
  // Get all permissions
  getPermissions: async (): Promise<Permission[]> => {
    return getRequest<Permission[]>('/utilities/permissions')
  },

  // Get assignable permission levels
  getAssignablePermissionLevels: async (): Promise<PermissionLevel[]> => {
    return getRequest<PermissionLevel[]>('/utilities/assignable-permission-levels')
  },

  // Get all states
  getStates: async (): Promise<State[]> => {
    return getRequest<State[]>('/utilities/states')
  },

  // Get all units
  getUnits: async (): Promise<Unit[]> => {
    return getRequest<Unit[]>('/utilities/units')
  },

  // Get statistics
  getStatistics: async (): Promise<Statistics> => {
    return getRequest<Statistics>('/utilities/statistics')
  }
}
