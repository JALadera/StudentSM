// frontend/src/services/api/grades.js
import createAxiosInstance, { API_BASE_URL } from './axios'

const gradesAPI = createAxiosInstance(`${API_BASE_URL}/grades`)

export const gradesService = {
  async createActivity(data) {
    const response = await gradesAPI.post("/activities/", {
      name: data.name,
      subject: data.subject,
      max_score: parseFloat(data.max_score),
      date: data.date,
    })
    return response.data
  },

  async createQuiz(data) {
    const response = await gradesAPI.post("/quizzes/", {
      name: data.name,
      subject: data.subject,
      max_score: parseFloat(data.max_score),
      date: data.date,
    })
    return response.data
  },

  async createExam(data) {
    const response = await gradesAPI.post("/exams/", {
      name: data.name,
      subject: data.subject,
      max_score: parseFloat(data.max_score),
      date: data.date,
    })
    return response.data
  },

  async getGradeBook(sectionId, subjectId) {
    const response = await gradesAPI.get(
      `/gradebook/${sectionId}/?subject=${subjectId}`
    )
    return response.data
  },

  async updateGrades(gradeData) {
    try {
      const response = await gradesAPI.post("/update/", {
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
    const response = await gradesAPI.put("/bulk-update/", { grades: gradesData })
    return response.data
  },

  async calculateFinalGrades(sectionId) {
    // This would be implemented based on your grading system
    const response = await gradesAPI.get(`/final-grades/${sectionId}/`)
    return response.data
  },

  async exportGrades(sectionId) {
    const response = await gradesAPI.get(`/export/${sectionId}/`, {
      responseType: "blob",
    })
    return response.data
  },

  async getActivities(subjectId) {
    const response = await gradesAPI.get(`/activities/?subject=${subjectId}`)
    return response.data
  },

  async getQuizzes(subjectId) {
    const response = await gradesAPI.get(`/quizzes/?subject=${subjectId}`)
    return response.data
  },

  async getExams(subjectId) {
    const response = await gradesAPI.get(`/exams/?subject=${subjectId}`)
    return response.data
  },

  async getStudentGrades(studentId) {
    try {
      const response = await gradesAPI.get(`/student-grades/${studentId}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching student grades:', error)
      throw error
    }
  },

  async getAssessments(subjectId) {
    const response = await gradesAPI.get(`/assessments/?subject=${subjectId}`)
    return response.data
  },

  async createAssessment(data) {
    const response = await gradesAPI.post('/assessments/', data)
    return response.data
  },

  async updateAssessment(id, data) {
    const response = await gradesAPI.put(`/assessments/${id}/`, data)
    return response.data
  },

  async deleteAssessment(id) {
    const response = await gradesAPI.delete(`/assessments/${id}/`)
    return response.data
  },

  async getAllAssessments() {
    const response = await gradesAPI.get('/assessments/')
    return response.data
  },

  async bulkUpdateGrades(assessmentId, data) {
    const response = await gradesAPI.post(`/assessments/${assessmentId}/bulk-update/`, data)
    return response.data
  },

  async getDashboardStats() {
    const response = await gradesAPI.get('/stats/')
    return response.data
  }
}
