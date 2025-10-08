import axios, { AxiosRequestConfig } from "axios"

const BASEURL = "https://amsa-ng.onrender.com/api/v1"

// Create a reusable axios instance
const api = axios.create({
    baseURL: BASEURL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Add request interceptor to dynamically set token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem("refreshToken")
            if (refreshToken) {
                try {
                    // Attempt token refresh
                    const response = await axios.post(`${BASEURL}/auth/refreshtoken`, {
                        refreshToken
                    })
                    
                    const newToken = response.data.accessToken
                    localStorage.setItem("accessToken", newToken)
                    
                    // Retry original request
                    error.config.headers.Authorization = `Bearer ${newToken}`
                    return api.request(error.config)
                } catch (refreshError) {
                    // Refresh failed, clear storage and redirect to login
                    localStorage.removeItem("accessToken")
                    localStorage.removeItem("refreshToken")
                    localStorage.removeItem("tokenType")
                    localStorage.removeItem("expiresIn")
                    localStorage.removeItem("scope")
                    window.location.href = '/sign-in'
                }
            } else {
                // No refresh token, redirect to login
                window.location.href = '/sign-in'
            }
        }
        return Promise.reject(error)
    }
)

// generic GET
export const getRequest = async <T>(url: string, config?: AxiosRequestConfig) => {
    const response = await api.get<T>(url, config)
    return response.data
}

// generic POST
export const postRequest = async <T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig
) => {
    const response = await api.post<T>(url, data, config)
    return response.data
}

// generic PUT
export const putRequest = async <T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig
) => {
    const response = await api.put<T>(url, data, config)
    return response.data
}

// generic PATCH
export const patchRequest = async <T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig
) => {
    const response = await api.patch<T>(url, data, config)
    return response.data
}

// generic DELETE
export const deleteRequest = async <T>(url: string, config?: AxiosRequestConfig) => {
    const response = await api.delete<T>(url, config)
    return response.data
}
