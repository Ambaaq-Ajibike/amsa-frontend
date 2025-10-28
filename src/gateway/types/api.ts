// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  totalItems: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth Types
export interface TokenRequest {
  memberNo: string
  password: string
}

export interface TokenResponse {
  name: string
  chandaNo: string
  unit: string
  permissions: string[]
  roles: string[]
  accessToken: string
  expiresIn: number
  tokenType: string
  scope: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword?: string
  newPassword?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  password: string
}

// User Types
export interface CreateUserRequest {
  memberNo: string
  password: string
  firstName: string
  lastName: string
  email: string
  unit: string
  phone: string
  level: string
  dob: string // ISO date string
}

export interface User {
  id: string
  memberNo: string
  firstName: string
  lastName: string
  email: string
  phone: string
  unit: string
  state: string
  dateOfBirth: string
  roles: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  memberNo: string
  firstName: string
  lastName: string
  email: string
  phone: string
  unit: string
  state: string
  dateOfBirth: string
  roles: string[]
}

export interface AssignUserRoleRequest {
  userId: string
  rolePermissions: RoleAndPermission[]
}

export interface RoleAndPermission {
  roleName: string
  permissionLevel: 'unit' | 'state' | 'national'
}

// Event Types
export interface CreateEventRequest {
  title: string
  description?: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  images: string[]
}

export interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  images: string[]
  status: 'upcoming' | 'ongoing' | 'completed'
  createdAt: string
  updatedAt: string
  registeredUsersCount: number
}

export interface EventRegistration {
  eventId: string
  userId: string
  registeredAt: string
  isPresent: boolean
  checkedInAt?: string
}

export interface EventParticipant {
  id: string
  userId: string
  eventId: string
  user: User
  isPresent: boolean
  markedPresent: boolean
  registeredAt: string
  checkedInAt?: string
}

// Role Types
export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export interface UpdateRoleRequest {
  name: string
  permissions: string[]
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

// Utility Types
export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export interface PermissionLevel {
  value: 'unit' | 'state' | 'national'
  label: string
}

export interface State {
  id: string
  name: string
  code: string
}

export interface Unit {
  id: string
  name: string
  code: string
  stateId: string
}

export interface Statistics {
  totalEvents: number
  totalActiveUsers: number
  totalAlumni: number
  registrationsPerMonth: {
    January: number
    February: number
    March: number
    April: number
    May: number
    June: number
    July: number
    August: number
    September: number
    October: number
    November: number
    December: number
  }
}

// Query Parameters
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  keyword?: string
  isAscending?: boolean
}

export interface EventQueryParams extends PaginationParams {
  status?: 'upcoming' | 'ongoing' | 'completed'
}

export interface UserQueryParams extends PaginationParams {
  usePaging?: boolean
  unit?: string
  state?: string
}

export interface EventParticipantsQueryParams extends PaginationParams {
  eventId: string
  isPresent?: boolean
}
