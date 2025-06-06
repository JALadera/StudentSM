import axios from './axios'

export const subjectsService = {
  async getAllSubjects() {
    try {
      const response = await axios.get('/subjects/')
      return response.data
    } catch (error) {
      console.error('Error fetching all subjects:', error)
      throw new Error(error.response?.data?.error || 'Failed to fetch all subjects')
    }
  },
  /**
   *
   * @returns {Promise<Array>} 
   */
  async getSubjectList() {
    try {
      const response = await axios.get('/subjects/');
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch subjects');
    }
  },
  
  /**
   * Get subject by ID
   * @param {string|number} id - Subject ID
   * @returns {Promise<Object>} Subject data
   */
  async getSubjectDetail(id) {
    try {
      const response = await axios.get(`/subjects/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subject ${id}:`, error);
      throw new Error(error.response?.data?.error || 'Failed to fetch subject');
    }
  },

  async createSubject(data) {
    try {
      const response = await axios.post('/subjects/', {
        ...data,
        prerequisites: data.prerequisites || []
      })
      return response.data
    } catch (error) {
      console.error('Error creating subject:', error)
      throw error
    }
  },

  async getSubjectDetail(id) {
    try {
      const response = await axios.get(`/subjects/${id}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching subject:', error)
      throw error
    }
  },

  async updateSubject(id, data) {
    try {
      const response = await axios.put(`/subjects/${id}/`, {
        ...data,
        prerequisites: data.prerequisites || []
      })
      return response.data
    } catch (error) {
      console.error('Error updating subject:', error)
      throw error
    }
  },

  async deleteSubject(id) {
    try {
      await axios.delete(`/subjects/${id}/`)
    } catch (error) {
      console.error('Error deleting subject:', error)
      throw error
    }
  },

  async getSubjectStudents(id) {
    try {
      const response = await axios.get(`/subjects/${id}/students/`)
      return response.data
    } catch (error) {
      console.error('Error fetching subject students:', error)
      throw error
    }
  },

  async assignStudentToSubject(subjectId, studentId) {
    try {
      const response = await axios.post(`/subjects/${subjectId}/students/`, { student: studentId })
      return response.data
    } catch (error) {
      console.error('Error assigning student to subject:', error)
      throw error
    }
  },

  async removeStudentFromSubject(subjectId, studentId) {
    try {
      await axios.delete(`/subjects/${subjectId}/students/${studentId}/`)
    } catch (error) {
      console.error('Error removing student from subject:', error)
      throw error
    }
  },

  async enrollStudent(enrollmentData) {
    try {
      // Ensure we have the required fields
      if (!enrollmentData || (!enrollmentData.subject_id && !enrollmentData.subject) || (!enrollmentData.student_id && !enrollmentData.student)) {
        throw new Error('Missing required fields: subject and student are required');
      }

      // Prepare the request data with the exact field names expected by the backend
      const requestData = {
        subject_id: String(enrollmentData.subject_id || enrollmentData.subject).trim(),
        student_id: String(enrollmentData.student_id || enrollmentData.student).trim()
      };
      
      console.log('Making enrollment request to /subjects/enroll/')
      console.log('Request data:', JSON.stringify(requestData, null, 2))
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        },
        validateStatus: function (status) {
          return status < 500 // Reject only if the status code is greater than or equal to 500
        }
      }
      
      // Make the request with proper error handling
      const response = await axios.post(
        '/subjects/enroll/', 
        requestData,
        config
      )
      
      console.log('Enrollment response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      })
      
      // Handle error responses
      if (response.status >= 400) {
        const errorMessage = response.data?.error || 
                          response.data?.detail || 
                          response.statusText || 
                          'Enrollment failed';
        const error = new Error(errorMessage);
        error.response = response;
        throw error;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in enrollStudent:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      })
      throw error
    }
  },

  async unenrollStudent(enrollmentId) {
    try {
      const response = await axios.post(`/subjects/enrollments/${enrollmentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error unenrolling student:', error);
      throw error;
    }
  },





  async updateGradeWeights(subjectId, weights) {
    try {
      const formattedWeights = {
        activity_weight: parseFloat(weights.activity_weight),
        quiz_weight: parseFloat(weights.quiz_weight),
        exam_weight: parseFloat(weights.exam_weight)
      };
      
      const response = await axios.put(`/subjects/${subjectId}/weights/`, formattedWeights);
      return response.data;
    } catch (error) {
      console.error('Error updating grade weights:', error);
      throw error;
    }
  },

  async bulkEnrollStudents(subjectId, data) {
    try {
      const response = await axios.post(`/subjects/${subjectId}/bulk-enroll/`, data)
      return response.data
    } catch (error) {
      console.error('Error bulk enrolling students:', error)
      throw error
    }
  }
}