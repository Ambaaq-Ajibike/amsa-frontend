import { toast } from "sonner"

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export class AppError extends Error {
  public status?: number
  public code?: string
  public details?: any

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const handleApiError = (error: any): ApiError => {
  // Network error
  if (!error.response) {
    return {
      message: "Network error. Please check your internet connection.",
      status: 0,
      code: "NETWORK_ERROR"
    }
  }

  // Server error with response
  const { status, data } = error.response
  
  // Handle different HTTP status codes
  switch (status) {
    case 400:
      return {
        message: data?.message || "Bad request. Please check your input.",
        status,
        code: "BAD_REQUEST",
        details: data
      }
    case 401:
      return {
        message: "Unauthorized. Please sign in again.",
        status,
        code: "UNAUTHORIZED",
        details: data
      }
    case 403:
      return {
        message: "Forbidden. You don't have permission to perform this action.",
        status,
        code: "FORBIDDEN",
        details: data
      }
    case 404:
      return {
        message: "Resource not found.",
        status,
        code: "NOT_FOUND",
        details: data
      }
    case 409:
      return {
        message: data?.message || "Conflict. The resource already exists.",
        status,
        code: "CONFLICT",
        details: data
      }
    case 422:
      return {
        message: data?.message || "Validation error. Please check your input.",
        status,
        code: "VALIDATION_ERROR",
        details: data
      }
    case 429:
      return {
        message: "Too many requests. Please try again later.",
        status,
        code: "RATE_LIMITED",
        details: data
      }
    case 500:
      return {
        message: "Internal server error. Please try again later.",
        status,
        code: "SERVER_ERROR",
        details: data
      }
    case 503:
      return {
        message: "Service unavailable. Please try again later.",
        status,
        code: "SERVICE_UNAVAILABLE",
        details: data
      }
    default:
      return {
        message: data?.message || "An unexpected error occurred.",
        status,
        code: "UNKNOWN_ERROR",
        details: data
      }
  }
}

export const showErrorToast = (error: any, customMessage?: string) => {
  const apiError = handleApiError(error)
  const message = customMessage || apiError.message
  
  toast.error(message, {
    description: apiError.code ? `Error Code: ${apiError.code}` : undefined,
    duration: 5000,
  })
}

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  })
}

export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 3000,
  })
}

export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 4000,
  })
}

// Validation error formatter
export const formatValidationErrors = (error: any): Record<string, string> => {
  if (error?.details?.errors) {
    const formatted: Record<string, string> = {}
    error.details.errors.forEach((err: any) => {
      if (err.field && err.message) {
        formatted[err.field] = err.message
      }
    })
    return formatted
  }
  return {}
}

// Retry utility for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain error types
      const apiError = handleApiError(error)
      if (apiError.status && [400, 401, 403, 404, 422].includes(apiError.status)) {
        throw error
      }
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}
