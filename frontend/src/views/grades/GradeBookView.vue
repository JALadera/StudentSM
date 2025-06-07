<!-- frontend/src/views/grades/GradeBookView.vue -->
<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-brand">Grade Book</h1>
          <router-link 
            v-if="selectedSubject"
            :to="{ name: 'SubjectDetail', params: { id: selectedSubject } }"
            class="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
          >
            <span>View Subject Details</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </router-link>
        </div>
        <div v-if="selectedSection && selectedSubject" class="flex space-x-4">
          <button
            @click="showAddAssessmentModal = true"
            class="btn btn-primary"
          >
            Add Assessment
          </button>
          <button
            @click="exportGrades"
            class="btn btn-secondary"
          >
            Export Grades
          </button>
        </div>
        <div v-else class="text-muted text-sm">
          Please select both section and subject to manage grades
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            v-model="selectedSection"
            @change="loadGradeBook"
            class="input"
          >
            <option value="">Select Section</option>
            <option v-for="section in sections" :key="section.id" :value="section.id">
              Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
            </option>
          </select>
          <select
            v-model="selectedSubject"
            @change="loadGradeBook"
            class="input"
          >
            <option value="">Select Subject</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.code }} - {{ subject.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Grade Table -->
      <div v-if="gradeBookData.length > 0" class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-theme">
            <thead class="bg-base">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Student</th>
                <th
                  v-for="assessment in assessments"
                  :key="assessment.id"
                  class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider"
                >
                  {{ assessment.name }}
                  <br>
                  <span class="text-xs text-muted">({{ assessment.max_score }} pts)</span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Average</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-theme">
              <tr v-for="student in gradeBookData" :key="student.student_id" 
                  class="hover:bg-elevated theme-transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-base">
                  {{ student.student_name }}
                </td>
                <td
                  v-for="assessment in assessments"
                  :key="assessment.id"
                  class="px-6 py-4 whitespace-nowrap text-sm"
                >
                  <input
                    v-model="student.grades[assessment.name]"
                    type="number"
                    :max="assessment.max_score"
                    min="0"
                    step="0.01"
                    @change="updateGrade(student.student_id, assessment.id, student.grades[assessment.name])"
                    class="input w-20 text-center"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-base">
                  {{ student.total_score }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="getGradeColor(student.average)" 
                        class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ student.average }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="selectedSection && selectedSubject" class="card p-6 text-center">
        <p class="text-muted">No grade data available for the selected section and subject.</p>
      </div>

      <div v-else class="card p-6 text-center">
        <p class="text-muted">Please select both a section and subject to view grades.</p>
      </div>

      <!-- Add Assessment Modal -->
      <div v-if="showAddAssessmentModal" 
           class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[480px] shadow-lg rounded-lg bg-elevated border-theme">
          <h3 class="text-xl font-medium text-base mb-6">Add New Assessment</h3>
          <form @submit.prevent="saveAssessment" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-muted">Assessment Name</label>
              <input
                v-model="assessmentForm.name"
                type="text"
                required
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-muted">Type</label>
              <select
                v-model="assessmentForm.assessment_type"
                required
                class="input"
              >
                <option value="activity">Activity</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted">Max Score</label>
              <input
                v-model="assessmentForm.max_score"
                type="number"
                min="1"
                step="0.01"
                required
                class="input"
              />
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeAssessmentModal"
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gradesService } from '@/services/api/grades.js'
import { studentsService } from '@/services/api/students.js'
import { subjectsService } from '@/services/api/subjects.js'
import { useToast } from 'vue-toastification'

export default {
  name: 'GradeBookView',
  setup() {
    // Initialize toast
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      gradeBookData: [],
      assessments: [],
      sections: [],
      subjects: [],
      selectedSection: '',
      selectedSubject: '',
      showAddAssessmentModal: false,
      saving: false,
      assessmentForm: {
        name: '',
        assessment_type: 'activity',
        max_score: '',
        subject: ''
      }
    }
  },
  async mounted() {
    await this.loadSections()
    await this.loadSubjects()
    
    // Set up toast defaults
    this.toast.updateDefaults({
      position: 'top-right',
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      rtl: false
    })
  },
  methods: {
    formatOrdinal(num) {
      const n = parseInt(num);
      return n + (['st','nd','rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th');
    },
    async loadSections() {
      try {
        this.sections = await studentsService.getSections()
      } catch (error) {
        console.error('Error loading sections:', error)
      }
    },
    
    async loadSubjects() {
      try {
        this.subjects = await subjectsService.getSubjectList()
      } catch (error) {
        console.error('Error loading subjects:', error)
      }
    },
    
    async loadGradeBook() {
      if (!this.selectedSection || !this.selectedSubject) return
      
      try {
        this.gradeBookData = await gradesService.getGradeBook(this.selectedSection, this.selectedSubject)
        await this.loadAssessments()
      } catch (error) {
        console.error('Error loading grade book:', error)
      }
    },
    
    async loadAssessments() {
      if (!this.selectedSubject) return
      
      try {
        this.assessments = await gradesService.getAssessments(this.selectedSubject)
      } catch (error) {
        console.error('Error loading assessments:', error)
      }
    },
    
    async updateGrade(studentId, assessmentId, score) {
      try {
        // Convert score to number
        const scoreNum = parseFloat(score);
        
        // Find the assessment to get max score
        const assessment = this.assessments.find(a => a.id === assessmentId);
        
        // Client-side validation
        if (isNaN(scoreNum)) {
          this.toast.error('Please enter a valid number');
          return;
        }
        
        if (scoreNum < 0) {
          this.toast.error('Score cannot be negative');
          return;
        }
        
        if (assessment && scoreNum > assessment.max_score) {
          this.toast.error(`Score (${scoreNum}) cannot exceed the maximum score (${assessment.max_score})`);
          return;
        }
        
        // If validation passes, proceed with the API call
        await gradesService.updateGrades({
          student: studentId,
          assessment: assessmentId,
          score: scoreNum
        });
        
        // Show success message
        this.toast.success('Grade updated successfully');
        
        // Reload grade book to update totals and averages
        await this.loadGradeBook();
      } catch (error) {
        console.error('Error updating grade:', error);
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.detail || 
                            'Failed to update grade';
        this.toast.error(errorMessage);
        
        // Reload to reset any invalid input
        await this.loadGradeBook();
      }
    },
    
    async saveAssessment() {
      this.saving = true;
      try {
        // Validate required fields
        if (!this.assessmentForm.name?.trim()) {
          throw new Error('Assessment name is required');
        }
        if (!this.selectedSubject) {
          throw new Error('Subject is required');
        }
        if (!this.assessmentForm.max_score || this.assessmentForm.max_score <= 0) {
          throw new Error('Max score must be greater than 0');
        }

        // Format the data according to API requirements
        const formData = {
          name: this.assessmentForm.name.trim(),
          subject: parseInt(this.selectedSubject), // Ensure subject is a number
          max_score: parseFloat(this.assessmentForm.max_score),
          assessment_type: this.assessmentForm.assessment_type,
          date: new Date().toISOString().split('T')[0] // Use current date if not provided
        };

        // Log the request data for debugging
        console.log('Creating assessment with data:', formData);

        // Make the API call
        const response = await gradesService.createAssessment(formData);
        
        this.toast.success('Assessment created successfully');
        await this.loadAssessments();
        await this.loadGradeBook();
        this.closeAssessmentModal();
      } catch (error) {
        console.error('Error saving assessment:', error);
        // Show more specific error message
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.error ||
                            error.message ||
                            'Failed to save assessment';
        this.toast.error(errorMessage);
      } finally {
        this.saving = false;
      }
    },
    
    closeAssessmentModal() {
      this.showAddAssessmentModal = false
      this.assessmentForm = {
        name: '',
        assessment_type: 'activity',
        max_score: '',
        subject: ''
      }
    },
    
    getGradeColor(average) {
      if (average >= 90) return 'bg-green-900/30 text-green-400'
      if (average >= 80) return 'bg-blue-900/30 text-blue-400'
      if (average >= 70) return 'bg-yellow-900/30 text-yellow-400'
      return 'bg-red-900/30 text-red-400'
    },
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
