import axios from './axios'

export const subjectsService = {
  async getAllSubjects() {
    try {
      const response = await axios.get('/subjects/')
      return response.data
    } catch (error) {
      console.error('Error fetching all subjects:', error)
      throw error
    }
  },
  async getSubjectList() {
    try {
      const response = await axios.get('/subjects/')
      return response.data
    } catch (error) {
      console.error('Error fetching subjects:', error)
      throw error
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
      console.log('Making enrollment request to /subjects/enroll/')
      console.log('Request data:', JSON.stringify(enrollmentData, null, 2))
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: function (status) {
          return status < 500 // Resolve only if the status code is less than 500
        }
      }
      
      // Ensure we're sending a proper JSON string
      const response = await axios.post(
        '/subjects/enroll/', 
        JSON.stringify(enrollmentData),
        config
      )
      
      console.log('Enrollment response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      })
      
      if (response.status >= 400) {
        const error = new Error(response.data?.error || 'Enrollment failed')
        error.response = response
        throw error
      }
      
      return response
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
      // Send a POST request to unenroll the student
      const response = await axios.post(`/subjects/enrollments/${enrollmentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error unenrolling student:', error);
      throw error;
    }
  },



  async getStudentEnrollments(studentId) {
    try {
      const response = await axios.get(`/subjects/student-enrollments/${studentId}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching student enrollments:', error)
      throw error
    }
  },

  async updateGradeWeights(subjectId, weights) {
    try {
      // Convert weights to numbers to ensure proper format
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