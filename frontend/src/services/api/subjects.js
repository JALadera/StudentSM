import createAxiosInstance, { API_BASE_URL } from './axios'

const subjectsAPI = createAxiosInstance(`${API_BASE_URL}/subjects`)

export const subjectsService = {
    async getSubjectList() {
        const response = await subjectsAPI.get("/")
        return response.data
    },

    async createSubject(data) {
        console.log('Creating subject with data:', data) // Add for debugging
        const response = await subjectsAPI.post("/", {
            ...data,
            prerequisites: data.prerequisites || []
        })
        return response.data
    },

    async getSubjectDetail(id) {
        const response = await subjectsAPI.get(`/${id}/`)
        return response.data
    },

    async updateSubject(id, data) {
        console.log('Updating subject with data:', data) // Add for debugging
        const response = await subjectsAPI.put(`/${id}/`, {
            ...data,
            prerequisites: data.prerequisites || []
        })
        return response.data
    },

    async deleteSubject(id) {
        const response = await subjectsAPI.delete(`/${id}/`)
        return response.data
    },

    // Keep enrollment methods
    async enrollStudent(subjectId, studentId) {
        const response = await subjectsAPI.post(`/enroll/`, {
            subject_id: subjectId,
            student_id: studentId
        })
        return response.data
    },

    async unenrollStudent(enrollmentId) {
        const response = await subjectsAPI.delete(`/enrollments/${enrollmentId}/`)
        return response.data
    },

    async getStudentEnrollments(studentId) {
        const response = await subjectsAPI.get(`/student-enrollments/${studentId}/`)
        return response.data
    },

    async updateGradeWeights(id, weights) {
        try {
            // Convert weights to numbers to ensure proper format
            const formattedWeights = {
                activity_weight: parseFloat(weights.activity_weight),
                quiz_weight: parseFloat(weights.quiz_weight),
                exam_weight: parseFloat(weights.exam_weight)
            };
            
            const response = await subjectsAPI.put(`/${id}/weights/`, formattedWeights);
            return response.data;
        } catch (error) {
            console.error('Error updating grade weights:', error);
            throw error;
        }
    },

    // Add to subjectsService
    async bulkEnrollStudents(subjectId, data) {
        const response = await subjectsAPI.post(`/${subjectId}/bulk-enroll/`, data)
        return response.data
    }
}