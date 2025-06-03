// frontend/src/services/api/students.js
import createAxiosInstance, { API_BASE_URL } from './axios'
import { authService } from "./auth"

const studentsAPI = createAxiosInstance(`${API_BASE_URL}/students`)

// Add request interceptor to handle auth
studentsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token refresh
studentsAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh token
        await authService.refreshToken()
        
        // Retry original request with new token
        const token = localStorage.getItem("access_token")
        originalRequest.headers.Authorization = `Bearer ${token}`
        return studentsAPI(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export const studentsService = {
  async registerStudent(data) {
    try {
        // Ensure all required fields are present
        const studentData = {
            student_id: data.student_id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            section: data.section,
            date_of_birth: data.date_of_birth // Add date of birth field
        }

        // Validate required fields
        const requiredFields = ['student_id', 'first_name', 'last_name', 'email', 'section', 'date_of_birth']
        for (const field of requiredFields) {
            if (!studentData[field]) {
                throw new Error(`${field.replace('_', ' ')} is required`)
            }
        }

        // Log the request data for debugging
        console.log('Registering student with data:', studentData)

        const response = await studentsAPI.post("/", studentData)
        return response.data
    } catch (error) {
        // Enhanced error handling
        if (error.response?.data) {
            console.error('Server error response:', error.response.data)
            const errors = Object.entries(error.response.data)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('\n')
            throw new Error(errors)
        }
        throw error
    }
  },

  async bulkRegisterStudents(data) {
    const response = await studentsAPI.post("/bulk-register/", data)
    return response.data
  },

  async getStudentList(params = {}) {
    try {
        const response = await studentsAPI.get('/', { params })
        return {
            results: response.data.results || response.data,
            count: response.data.count || response.data.length
        }
    } catch (error) {
        console.error('Error fetching students:', error)
        throw error
    }
  },

  async getStudentDetail(id) {
    try {
        console.log('Fetching student details for ID:', id) // Debug log
        const response = await studentsAPI.get(`/${id}/`)
        console.log('API Response:', response.data) // Debug log
        return response.data
    } catch (error) {
      console.error('Error fetching student details:', error)
      throw error
    }
  },

  async updateStudent(id, data) {
    const response = await studentsAPI.put(`/${id}/`, data)
    return response.data
  },

  async deleteStudent(id) {
    const response = await studentsAPI.delete(`/${id}/`)
    return response.data
  },

  async assignToSection(studentId, sectionId) {
    try {
      const response = await studentsAPI.put(`/${studentId}/section/`, {
        section_id: parseInt(sectionId)
      })
      return response.data
    } catch (error) {
      console.error('Error assigning section:', error)
      throw error
    }
  },

  async getSections() {
    try {
      const response = await studentsAPI.get('/sections/')
      console.log('API Response:', response.data) // Add this line
      return response.data
    } catch (error) {
      console.error('Error fetching sections:', error)
      throw error
    }
  },

  async bulkAssignSection(data) {
    const response = await studentsAPI.post('/bulk-assign-section/', data)
    return response.data
  },
}
