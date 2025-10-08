export interface AddUserRequest {
    memberNo: string
    password: string
    firstName: string
    lastName: string
    email: string
    unit: string
    phone: string
    level: string
    dob: string // ISO date string, e.g. "2025-08-31T06:37:21.338Z"
}
export interface UserResponse {
    surname: string
    firstName: string
    middleName: string
    maidenName: string
    dateOfBirth: string // ISO 8601 date string, e.g. "1990-04-08T00:00:00"
    email: string
    phoneNo: string
    nationality: string
}

export interface UserProfileResponse {
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