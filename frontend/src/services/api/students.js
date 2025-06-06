// frontend/src/services/api/students.js
import axios from './axios';

/**
 * Students API service
 * Handles all student-related API calls
 */
export const studentsService = {
  /**
   * Get student by ID or student_id
   * @param {string|number} id - Student ID or student_id
   * @returns {Promise<Object>} Student data
   */
  async getStudent(id) {
    try {
      // First try by ID
      const response = await axios.get(`/students/${id}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // If not found by ID, try by student_id
        try {
          const response = await axios.get(`/students/by-student-id/${id}/`);
          return response.data;
        } catch (innerError) {
          console.error('Error fetching student by student_id:', innerError);
          throw new Error(innerError.response?.data?.error || 'Student not found');
        }
      }
      console.error('Error fetching student:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch student');
    }
  },

  /**
   * Get all students
   * @returns {Promise<Array>} List of students
   */
  async getStudents() {
    try {
      const response = await axios.get('/students/')
      return response.data
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  },

  /**
   * Get student by database ID
   * @param {string|number} id - Student database ID
   * @returns {Promise<Object>} Student data
   */
  async getStudentById(id) {
    try {
      const response = await axios.get(`/students/${id}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching student by ID:', error)
      throw error
    }
  },

  /**
   * Get student by student ID (student number)
   * @param {string} studentId - Student ID number
   * @returns {Promise<Object>} Student data
   */
  async getStudentByStudentId(studentId) {
    try {
      const response = await axios.get(`/students/by-student-id/${studentId}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching student by student ID:', error)
      throw error
    }
  },

  async createStudent(data) {
    try {
      const response = await axios.post('/students/', data)
      return response.data
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  },

  async updateStudent(id, data) {
    try {
      const response = await axios.put(`/students/${id}/`, data)
      return response.data
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  },

  async deleteStudent(id) {
    try {
      await axios.delete(`/students/${id}/`)
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  },

  async registerStudent(data) {
    try {
      const response = await axios.post('/students/', data)
      return response.data
    } catch (error) {
      console.error('Error registering student:', error)
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error
    }
  },

  async bulkRegisterStudents(data) {
    try {
      const response = await axios.post("/students/bulk-register/", data)
      return response.data
    } catch (error) {
      console.error('Error bulk registering students:', error)
      throw error
    }
  },

  async getStudentList(params = {}) {
    try {
      const queryParams = {
        ...params,
        page: params.page || 1,
        page_size: params.perPage || 10,
        ordering: params.ordering || 'last_name,first_name',
        search: params.search || '',
        section: params.section || ''
      }
      
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });
      
      const response = await axios.get('/students/', { params: queryParams });
      
      return {
        results: response.data.results || [],
        count: response.data.count || 0,
        page: parseInt(response.data.current_page || queryParams.page || 1),
        page_size: parseInt(response.data.page_size || queryParams.page_size || 10)
      };
    } catch (error) {
      console.error('Error fetching students:', error);
      return {
        results: [],
        count: 0,
        page: 1,
        page_size: params.perPage || 10
      };
    }
  },

  getStudentDetail: async function(id) {
    try {
      const response = await axios.get(`/students/${id}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching student details:', error)
      throw error
    }
  },

  async updateStudent(id, data) {
    try {
      const response = await axios.put(`/students/${id}/`, data)
      return response.data
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  },

  async deleteStudent(id) {
    try {
      const response = await axios.delete(`/students/${id}/`)
      return response.data
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  },

  async assignToSection(studentId, sectionId) {
    try {
      const response = await axios.put(`/students/${studentId}/section/`, {
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
      const response = await axios.get('/students/sections/')
      return response.data
    } catch (error) {
      console.error('Error fetching sections:', error)
      return []
    }
  },

  async bulkAssignSection(data) {
    return axios.post('/students/bulk-assign-section/', data)
  },

  /**
   * Get all enrollments for a specific student
   * @param {string|number} studentId - Student ID
   * @returns {Promise<Array>} List of enrollments
   */
  async getStudentEnrollments(studentId) {
    try {
      const response = await axios.get(`/subjects/student-enrollments/${studentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch student enrollments');
    }
  },

  /**
   * Get all enrollments with optional filters
   * Note: This endpoint might not be implemented in the backend
   * @param {Object} [params] - Query parameters
   * @returns {Promise<Object>} Paginated list of enrollments
   */
  async getEnrollments(params = {}) {
    try {
      // This endpoint might need to be implemented in the backend
      const response = await axios.get('/subjects/enrollments/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      // Return empty array if endpoint doesn't exist
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch enrollments');
    }
  }
}
