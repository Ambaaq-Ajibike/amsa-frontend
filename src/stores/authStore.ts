import { create } from 'zustand'

const ACCESS_TOKEN = 'accessToken'
const USER_DATA = 'userData'

interface AuthUser {
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

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = localStorage.getItem(ACCESS_TOKEN) || ''
  
  // Try to restore user data from localStorage
  let initUser: AuthUser | null = null
  try {
    const savedUserData = localStorage.getItem(USER_DATA)
    if (savedUserData) {
      initUser = JSON.parse(savedUserData)
    }
  } catch (error) {
    console.warn('Failed to parse saved user data:', error)
    localStorage.removeItem(USER_DATA)
  }
  
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          // Save user data to localStorage
          if (user) {
            localStorage.setItem(USER_DATA, JSON.stringify(user))
          } else {
            localStorage.removeItem(USER_DATA)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          localStorage.setItem(ACCESS_TOKEN, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          localStorage.removeItem(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          localStorage.removeItem(ACCESS_TOKEN)
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("tokenType")
          localStorage.removeItem("expiresIn")
          localStorage.removeItem("scope")
          localStorage.removeItem(USER_DATA)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

// export const useAuth = () => useAuthStore((state) => state.auth)
