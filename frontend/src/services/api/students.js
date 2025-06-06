// frontend/src/services/api/students.js
import axios from './axios'

export const studentsService = {
  async getStudents() {
    try {
      const response = await axios.get('/students/')
      return response.data
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  },

  async getStudent(id) {
    try {
      const response = await axios.get(`/students/${id}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching student:', error)
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
    const response = await axios.post('/students/bulk-assign-section/', data)
    return response.data
  },
}
