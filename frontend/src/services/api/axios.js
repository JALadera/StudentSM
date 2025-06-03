import axios from 'axios'
import { authService } from './auth'

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          await authService.refreshToken()
          const token = localStorage.getItem("access_token")
          originalRequest.headers.Authorization = `Bearer ${token}`
          return instance(originalRequest)
        } catch (refreshError) {
          authService.redirectToLogin()
          return Promise.reject(refreshError)
        }
      }

      if (error.response?.status === 401) {
        authService.redirectToLogin()
      }

      return Promise.reject(error)
    }
  )

  return instance
}

export const API_BASE_URL = "http://localhost:8000/api"
export default createAxiosInstance