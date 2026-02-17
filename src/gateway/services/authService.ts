import { postRequest } from '../apiService'
import type {
  TokenRequest,
  TokenResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../types/api'

export const authService = {
  // Login with member number and password
  login: async (credentials: TokenRequest): Promise<TokenResponse> => {
    return postRequest<TokenResponse, TokenRequest>('/auth/token', credentials)
  },

  // Refresh access token
  refreshToken: async (refreshToken: RefreshTokenRequest): Promise<TokenResponse> => {
    return postRequest<TokenResponse, RefreshTokenRequest>('/auth/refreshtoken', refreshToken)
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    return postRequest<void, ChangePasswordRequest>('/auth/changepassword', passwordData)
  },

  // Forgot password
  forgotPassword: async (email: ForgotPasswordRequest): Promise<void> => {
    return postRequest<void, ForgotPasswordRequest>('/auth/forgotpassword', email)
  },

  // Reset password
  resetPassword: async (resetData: ResetPasswordRequest): Promise<void> => {
    return postRequest<void, ResetPasswordRequest>('/auth/resetpassword', resetData, {
      headers: {
        'X-Skip-Auto-Redirect': 'true',
      },
    })
  }
}
