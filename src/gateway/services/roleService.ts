import { getRequest, postRequest, putRequest } from '../apiService'
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  Role,
  PaginatedResponse,
  PaginationParams
} from '../types/api'

export const roleService = {
  // Get all roles with pagination and filters
  getRoles: async (params: PaginationParams = {}): Promise<PaginatedResponse<Role>> => {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('Page', params.page.toString())
    if (params.pageSize) searchParams.append('PageSize', params.pageSize.toString())
    if (params.sortBy) searchParams.append('SortBy', params.sortBy)
    if (params.keyword) searchParams.append('Keyword', params.keyword)
    if (params.isAscending !== undefined) searchParams.append('IsAscending', params.isAscending.toString())

    const queryString = searchParams.toString()
    return getRequest<PaginatedResponse<Role>>(`/roles${queryString ? `?${queryString}` : ''}`)
  },

  // Get all roles (no pagination)
  getAllRoles: async (): Promise<Role[]> => {
    return getRequest<Role[]>('/roles/all')
  },

  // Create new role
  createRole: async (roleData: CreateRoleRequest): Promise<Role> => {
    return postRequest<Role, CreateRoleRequest>('/roles', roleData)
  },

  // Update role
  updateRole: async (name: string, roleData: UpdateRoleRequest): Promise<Role> => {
    return putRequest<Role, UpdateRoleRequest>(`/roles/${name}`, roleData)
  }
}
