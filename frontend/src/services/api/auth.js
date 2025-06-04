// frontend/src/services/api/auth.js
import createAxiosInstance, { API_BASE_URL } from './axios'

const authAPI = createAxiosInstance(`${API_BASE_URL}/auth`)

// Request interceptor to add token
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        try {
          // Get new tokens
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          })

          // Update stored tokens
          localStorage.setItem("access_token", response.data.access)
          if (response.data.refresh) {
            localStorage.setItem("refresh_token", response.data.refresh)
          }

          // Retry the original request with new token
          error.config.headers.Authorization = `Bearer ${response.data.access}`
          return authAPI.request(error.config)
        } catch (refreshError) {
          // Clear tokens and redirect to login
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token") 
          localStorage.removeItem("user")
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  },
)

export const authService = {
  async login(credentials) {
    try {
      const response = await authAPI.post("/login/", credentials)
      const { access, refresh, user } = response.data
      
      // Store tokens and user data
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      localStorage.setItem("user", JSON.stringify(user))
      
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials')
      }
      throw new Error('Login failed. Please try again.')
    }
  },

  async logout() {
    try {
      const refresh_token = localStorage.getItem('refresh_token')
      if (refresh_token) {
        await authAPI.post('/blacklist/', { refresh_token })
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
        refresh: refreshToken
      })

      localStorage.setItem("access_token", response.data.access)
      if (response.data.refresh) {
        localStorage.setItem("refresh_token", response.data.refresh)
      }

      return response.data
    } catch (error) {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      throw error
    }
  },

  async updateProfile(data) {
    const response = await authAPI.put("/profile/", data)
    localStorage.setItem("user", JSON.stringify(response.data))
    return response.data
  },

  async resetPassword(email) {
    const response = await authAPI.post("/reset-password/", { email })
    return response.data
  },

  getCurrentUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    const token = localStorage.getItem("access_token")
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  },

  redirectToLogin() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  },

  async register(data) {
    try {
      const response = await authAPI.post("/register/", {
        username: data.username,
        password: data.password,
        confirm_password: data.confirm_password, // Make sure to include this
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: 'teacher',
        phone: data.phone || ''
      })
      return response.data
    } catch (error) {
      console.error('Registration error:', error.response?.data || error)
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        'Registration failed. Please try again.'
      )
    }
  },

  validatePassword(password) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*]/.test(password)

    const errors = []
    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters`)
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter')
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter')
    if (!hasNumbers) errors.push('Password must contain at least one number')
    if (!hasSpecialChar) errors.push('Password must contain at least one special character')

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
