import { getRequest, postRequest, putRequest } from '../apiService'
import type {
  CreateUserRequest,
  User,
  UserProfile,
  AssignUserRoleRequest,
  UserQueryParams,
  PaginatedResponse
} from '../types/api'
import type { UserResponse } from '../types/user'

export const userService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return getRequest<UserProfile>('/users/profile')
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    return putRequest<UserProfile, Partial<UserProfile>>('/users/profile', profileData)
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    return getRequest<User>(`/users/get-user/${id}`)
  },

  // Get user by member number
  getUserByMemberNo: async (memberNo: string): Promise<UserResponse> => {
    return getRequest<UserResponse>(`/users/${memberNo}`)
  },

  // Get all users with pagination and filters
  getUsers: async (params: UserQueryParams = {}): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('Page', params.page.toString())
    if (params.pageSize) searchParams.append('PageSize', params.pageSize.toString())
    if (params.sortBy) searchParams.append('SortBy', params.sortBy)
    if (params.keyword) searchParams.append('Keyword', params.keyword)
    if (params.isAscending !== undefined) searchParams.append('IsAscending', params.isAscending.toString())
    if (params.usePaging !== undefined) searchParams.append('UsePaging', params.usePaging.toString())
    if (params.unit) searchParams.append('Unit', params.unit)
    if (params.state) searchParams.append('State', params.state)

    const queryString = searchParams.toString()
    return getRequest<PaginatedResponse<User>>(`/users${queryString ? `?${queryString}` : ''}`)
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return postRequest<User, CreateUserRequest>('/users', userData)
  },

  // Assign role to user
  assignUserRole: async (roleData: AssignUserRoleRequest): Promise<void> => {
    return postRequest<void, AssignUserRoleRequest>('/users/assign-role', roleData)
  },

  // Export users as Excel file
  exportUsersAsExcel: async (params?: UserQueryParams): Promise<Blob> => {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('Page', params.page.toString())
    if (params?.pageSize) searchParams.append('PageSize', params.pageSize.toString())
    if (params?.sortBy) searchParams.append('SortBy', params.sortBy)
    if (params?.keyword) searchParams.append('Keyword', params.keyword)
    if (params?.isAscending !== undefined) searchParams.append('IsAscending', params.isAscending.toString())
    if (params?.unit) searchParams.append('Unit', params.unit)
    if (params?.state) searchParams.append('State', params.state)

    const queryString = searchParams.toString()
    const response = await fetch(`/api/users/export${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to export users: ${response.statusText}`)
    }

    return response.blob()
  }
}
