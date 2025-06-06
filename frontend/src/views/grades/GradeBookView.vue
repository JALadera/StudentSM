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
                  <div class="relative">
                    <input
                      v-model="student.grades[assessment.name]"
                      type="number"
                      :max="assessment.max_score"
                      min="0"
                      step="0.01"
                      @input="validateGradeInput($event, assessment.max_score)"
                      @change="updateGrade(student.student_id, assessment.id, student.grades[assessment.name])"
                      class="input w-20 text-center"
                      :class="{ 'border-red-500': student.grades[assessment.name] > assessment.max_score }"
                    />
                    <span v-if="student.grades[assessment.name] > assessment.max_score" 
                          class="absolute -bottom-5 left-0 text-xs text-red-500">
                      Max: {{ assessment.max_score }}
                    </span>
                  </div>
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
import { useToast } from 'vue-toastification'
import { subjectsService } from '@/services/api/subjects.js'

export default {
  name: 'GradeBookView',
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
  },
  setup() {
    const toast = useToast()
    return { toast }
  },
  methods: {
    validateGradeInput(event, maxScore) {
      const input = event.target;
      const value = parseFloat(input.value);
      
      if (isNaN(value)) return;
      
      // If the value exceeds max score, show a warning but allow typing
      // The actual validation happens on change
      if (value > maxScore) {
        input.setCustomValidity(`Score cannot exceed ${maxScore}`);
        this.toast.warning(`Maximum score is ${maxScore}`, { timeout: 2000 });
      } else {
        input.setCustomValidity('');
      }
    },
    
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
        // Parse the score
        const parsedScore = parseFloat(score);
        
        // Skip if not a valid number
        if (isNaN(parsedScore)) {
          this.toast.error('Please enter a valid number');
          return;
        }
        
        // Find the assessment to get max_score
        const assessment = this.assessments.find(a => a.id === assessmentId);
        
        // Client-side validation
        if (assessment && parsedScore > assessment.max_score) {
          this.toast.error(`Score cannot exceed the maximum score of ${assessment.max_score}`, { timeout: 3000 });
          
          // Reset the input to max score
          const student = this.gradeBookData?.students?.find(s => s.student_id === studentId);
          if (student) {
            student.grades[assessment.name] = assessment.max_score;
            // Trigger a re-render
            this.$forceUpdate();
          }
          return;
        }
        
        // Show loading indicator
        const toastId = this.toast.info('Updating grade...', { timeout: false });
        
        try {
          // If validation passes, proceed with the API call
          await gradesService.updateGrades({
            student: studentId,
            assessment: assessmentId,
            score: parsedScore
          });
          
          // Update success message
          this.toast.update(toastId, {
            content: 'Grade updated successfully',
            type: 'success',
            timeout: 3000
          });
          
          // Reload grade book to update totals and averages
          await this.loadGradeBook();
          
        } catch (error) {
          // Dismiss loading toast
          this.toast.dismiss(toastId);
          throw error; // Re-throw to be caught by outer catch
        }
        
      } catch (error) {
        console.error('Error updating grade:', error);
        let errorMessage = 'Failed to update grade';
        
        // Handle specific error cases
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = error.response.data.error || 'Invalid data provided';
          } else if (error.response.status === 404) {
            errorMessage = 'Student or assessment not found';
          } else if (error.response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        this.toast.error(errorMessage);
      }
    },
    
    async saveAssessment() {
      this.saving = true
      try {
        const serviceMethod = {
          activity: gradesService.createActivity,
          quiz: gradesService.createQuiz,
          exam: gradesService.createExam
        }[this.assessmentForm.assessment_type]
        
        // Include the selected subject in the form data
        const formData = {
          ...this.assessmentForm,
          subject: this.selectedSubject,
          max_score: parseFloat(this.assessmentForm.max_score)
        }
        
        await serviceMethod(formData)
        await this.loadAssessments()
        await this.loadGradeBook()
        this.closeAssessmentModal()
      } catch (error) {
        console.error('Error saving assessment:', error)
        alert(error.response?.data?.detail || 'Failed to save assessment')
      } finally {
        this.saving = false
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
