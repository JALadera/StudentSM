// frontend/src/services/api/grades.js
import axios from "./axios"


export const gradesService = {
  async createAssessment(data) {
    try {
      const response = await axios.post("/grades/assessments/", {
        name: data.name,
        subject: data.subject,  // This should be the subject ID
        max_score: parseFloat(data.max_score),
        date: data.date || new Date().toISOString().split('T')[0], // Ensure date is in YYYY-MM-DD format
        assessment_type: data.type || 'activity'  // Default to activity if type not specified
      });
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error.response?.data || error.message);
      throw error;
    }
  },

  async createQuiz(data) {
    return gradesService.createAssessment({
      ...data,
      type: 'quiz'
    })
  },

  async createExam(data) {
    return gradesService.createAssessment({
      ...data,
      type: 'exam'
    })
  },

  async getGradeBook(sectionId, subjectId) {
    try {
      const response = await axios.get(`/grades/gradebook/${sectionId}/`, {
        params: {
          subject: subjectId
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching gradebook:', error)
      throw error
    }
  },

  async updateGrades(gradeData) {
    try {
      const response = await axios.post("/grades/update/", {
        student: gradeData.student,
        assessment: gradeData.assessment,
        score: parseFloat(gradeData.score),
      })
      return response.data
    } catch (error) {
      console.error("Error updating grade:", error)
      throw error
    }
  },

  async bulkUpdateGrades(gradesData) {
    const response = await axios.put("/grades/bulk-update/", { grades: gradesData })
    return response.data
  },

  async calculateFinalGrades(sectionId) {
    // This would be implemented based on your grading system
    const response = await axios.get(`/grades/final-grades/${sectionId}/`)
    return response.data
  },

  async exportGrades(sectionId) {
    const response = await axios.get(`/grades/export/${sectionId}/`, {
      responseType: "blob",
    })
    return response.data
  },

  async getActivities() {
    const response = await axios.get("/grades/activities/")
    return response.data
  },

  async getQuizzes() {
    const response = await axios.get("/grades/assessments/?type=quiz")
    return response.data
  },

  async getExams() {
    const response = await axios.get("/grades/assessments/?type=exam")
    return response.data
  },

  async getStudentGrades(studentId) {
    try {
      console.log(`Fetching grades for student ${studentId}`);
      const response = await axios.get(`/grades/student-grades/${studentId}/`);
      console.log('Grades API response:', response.data);
      
      // Ensure we have valid data
      if (!Array.isArray(response.data)) {
        console.error('Unexpected response format from grades API:', response.data);
        return [];
      }
      
      // Transform the response to match the expected format
      const grades = response.data.map(grade => ({
        subject_code: grade.subject_code || '',
        subject_name: grade.subject_name || 'Unknown Subject',
        final_grade: typeof grade.final_grade === 'number' ? grade.final_grade : 0,
        status: grade.status || 'N/A'
      }));
      
      console.log('Processed grades:', grades);
      return grades;
    } catch (error) {
      console.error('Error fetching student grades:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      return []; // Return empty array instead of throwing to prevent UI breakage
    }
  },

  async getAssessments(subjectId) {
    try {
      const response = await axios.get(`/grades/assessments/?subject=${subjectId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching assessments:', error)
      throw error
    }
  },

  async createAssessment(data) {
    const response = await axios.post('/grades/assessments/', data)
    return response.data
  },

  async updateAssessment(id, data) {
    const response = await axios.put(`/grades/assessments/${id}/`, data)
    return response.data
  },

  async deleteAssessment(id) {
    const response = await axios.delete(`/grades/assessments/${id}/`)
    return response.data
  },

  async getAllAssessments() {
    const response = await axios.get('/grades/assessments/')
    return response.data
  },

  async bulkUpdateGrades(assessmentId, data) {
    const response = await axios.post(`/grades/assessments/${assessmentId}/bulk-update/`, data)
    return response.data
  },

  async getDashboardStats() {
    const response = await axios.get('/grades/stats/')
    return response.data
  }
}
