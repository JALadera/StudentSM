import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      
      // If error is 401 and we haven't tried refreshing yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        try {
          const refreshToken = localStorage.getItem('refresh_token')
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          })

          const { access } = response.data
          localStorage.setItem('access_token', access)
          
          originalRequest.headers.Authorization = `Bearer ${access}`
          return instance(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
      return Promise.reject(error)
    }
  )

  return instance
}

export { API_BASE_URL }
export default createAxiosInstance