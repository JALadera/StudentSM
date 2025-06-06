import axios from 'axios'

const API_BASE_URL = import.meta.env.production.VITE_API_URL

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 30000 // 30 second timeout
})

// Request interceptor - add auth token and logging
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    console.log('Axios request interceptor - token from localStorage:', token ? 'Token found' : 'No token found')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Added Authorization header to request')
    } else {
      console.warn('No access token found in localStorage')
    }
    
    // Log request details (only in development)
    if (import.meta.env.DEV) {
      console.log('[API Request]', {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: { ...config.headers, Authorization: 'Bearer [REDACTED]' } // Don't log the actual token
      })
    }
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors and logging
instance.interceptors.response.use(
  (response) => {
    // Log successful response (only in development)
    if (import.meta.env.DEV) {
      console.log('[API Response]', {
        status: response.status,
        data: response.data
      })
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token available')

        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken })
        const { access } = response.data
        localStorage.setItem('access_token', access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        
        return instance(originalRequest)
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message
    console.error('[API Error]', {
      status: error.response?.status,
      message: errorMessage,
      details: error.response?.data
    })

    // Return error object with status and message
    const errorResponse = {
      status: error.response?.status || 500,
      message: errorMessage
    }

    return Promise.reject(errorResponse)
  }
)

// Export the axios instance and base URL
export default instance
export { API_BASE_URL }
export const axiosInstance = instance
export const createAxiosInstance = (baseUrl) => {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 30000
  })
}
