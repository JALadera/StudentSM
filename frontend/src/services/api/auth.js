// frontend/src/services/api/auth.js
import axios from './axios'

export const authService = {
  async login(credentials) {
    try {
      console.log('Attempting login with credentials:', credentials)
      const response = await axios.post("/auth/login/", credentials)
      console.log('Login response:', response.data)
      
      const { access, refresh, user } = response.data
      
      // Store tokens and user data
      console.log('Storing tokens in localStorage')
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      localStorage.setItem("user", JSON.stringify(user))
      
      console.log('Login successful, tokens stored')
      return response.data
    } catch (error) {
      console.error('Login error:', error)
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
        await axios.post('/auth/logout/', { refresh_token })
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
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
      const response = await axios.post('/auth/refresh/', {
        refresh: refreshToken,
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
    try {
      const response = await axios.put("/auth/profile/", data)
      localStorage.setItem("user", JSON.stringify(response.data))
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  async resetPassword(email) {
    try {
      const response = await axios.post("/auth/reset-password/", { email })
      return response.data
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
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
      const response = await axios.post("/register/", {
        username: data.username,
        password: data.password,
        confirm_password: data.confirm_password, 
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
