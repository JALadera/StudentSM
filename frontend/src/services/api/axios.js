import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL
console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 30000
})

// Request interceptor - add auth token and logging
instance.interceptors.request.use(
  (config) => {
    console.log(`[${new Date().toISOString()}] Making request to:`, config.url)
    const token = localStorage.getItem('access_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No access token found in localStorage')
    }
    
    // Log request details (without sensitive data)
    const logConfig = {
      method: config.method,
      url: config.url,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
      }
    }
    console.log('Request config:', logConfig)
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors and logging
instance.interceptors.response.use(
  (response) => {
    console.log(`[${new Date().toISOString()}] Response from:`, response.config.url, 'Status:', response.status)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Log the error
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest?.url,
        data: error.response.data
      })
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Request setup error:', error.message)
    }
    
    // Handle 401 Unauthorized (token refresh)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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
