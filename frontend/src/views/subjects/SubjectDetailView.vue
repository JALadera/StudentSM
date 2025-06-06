<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-brand">Subject Details</h1>
          <p class="text-muted mt-2">Manage subject information and grade weights</p>
        </div>
        <div class="flex space-x-4">
          <button
            @click="showEnrollModal = true"
            class="btn btn-primary"
          >
            Enroll Student
          </button>
          <button
            @click="goBack"
            class="btn btn-secondary"
          >
            Back
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-brand"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg mb-6">
        {{ error }}
      </div>

      <!-- Subject Information -->
      <div v-else-if="subject" class="space-y-6">
        <div class="card p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-muted">Subject Code</label>
              <p class="text-xl text-base">{{ subject.code }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-muted">Subject Name</label>
              <p class="text-xl text-base">{{ subject.name }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-muted">Units</label>
              <p class="text-xl text-base">{{ subject.units }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-muted">Year Level</label>
              <p class="text-xl text-base">Year {{ subject.year_level }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-muted">Enrolled Students</label>
              <p class="text-xl text-base">{{ subject.enrollment_count || 0 }}</p>
            </div>
          </div>

          <div class="mt-6">
            <label class="text-muted">Prerequisites</label>
            <p class="text-xl text-base">
              <span v-if="subject.prerequisites?.length">
                {{ formatPrerequisites(subject.prerequisites) }}
              </span>
              <span v-else class="text-muted">None</span>
            </p>
          </div>
        </div>

        <!-- Grade Weights Section -->
        <div class="card p-6">
          <h2 class="text-2xl font-semibold text-brand mb-4">Grade Category Weights</h2>
          
          <form @submit.prevent="saveWeights" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-muted">Activities (%)</label>
                <input
                  v-model="weights.activity_weight"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-muted">Quizzes (%)</label>
                <input
                  v-model="weights.quiz_weight"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-muted">Exams (%)</label>
                <input
                  v-model="weights.exam_weight"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  class="input"
                />
              </div>
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="!isValidWeights"
                class="btn btn-primary disabled:opacity-50"
              >
                Save Weights
              </button>
            </div>
          </form>
        </div>

        <!-- Assessment Section -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-brand">Assessments</h2>
            <button
              @click="showAddAssessmentModal = true"
              class="btn btn-primary"
            >
              Add Assessment
            </button>
          </div>

          <!-- Assessment Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-theme">
              <thead class="bg-base">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Max Score</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-theme">
                <tr v-for="assessment in assessments" :key="assessment.id" 
                    class="hover:bg-elevated theme-transition">
                  <td class="px-6 py-4 whitespace-nowrap text-base">{{ assessment.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-base">{{ assessment.assessment_type }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-base">{{ assessment.max_score }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-base">{{ formatDate(assessment.date) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button 
                      @click="editAssessment(assessment)"
                      class="text-muted hover:text-brand mr-3 theme-transition"
                    >
                      Edit
                    </button>
                    <button 
                      @click="deleteAssessment(assessment.id)"
                      class="text-muted hover:text-brand theme-transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Add/Edit Assessment Modal -->
          <div v-if="showAddAssessmentModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-6 border w-[480px] shadow-lg rounded-lg bg-elevated border-theme">
              <h3 class="text-xl font-medium text-base mb-6">
                {{ isEditing ? 'Edit' : 'Add' }} Assessment
              </h3>
              
              <form @submit.prevent="saveAssessment" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-muted">Name</label>
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
                    min="0"
                    step="0.01"
                    required
                    class="input"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-muted">Date</label>
                  <input
                    v-model="assessmentForm.date"
                    type="date"
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
                    {{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Save') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Enroll Student Modal -->
      <div v-if="showEnrollModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[600px] shadow-lg rounded-lg bg-elevated border-theme">
          <h3 class="text-xl font-medium text-base mb-6">
            Enroll Student in {{ subject?.code }} - {{ subject?.name }}
          </h3>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-muted mb-2">Search Students</label>
            <input
              v-model="studentSearch"
              type="text"
              placeholder="Search by name or ID"
              class="input w-full"
              @input="searchStudents"
            />
          </div>

          <div class="max-h-96 overflow-y-auto mb-6 border rounded-lg border-theme">
            <table class="min-w-full divide-y divide-theme">
              <thead class="bg-base sticky top-0">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Select</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Student ID</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Name</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Year Level</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-theme">
                <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-elevated">
                  <td class="px-4 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      :value="student.id"
                      v-model="selectedStudents"
                      class="rounded text-brand focus:ring-brand"
                    />
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm">{{ student.student_id }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm">
                    {{ student.last_name }}, {{ student.first_name }} {{ student.middle_name || '' }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm">Year {{ student.year_level }}</td>
                </tr>
                <tr v-if="filteredStudents.length === 0">
                  <td colspan="4" class="px-4 py-4 text-center text-sm text-muted">
                    No students found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeEnrollModal"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="enrollStudents"
              :disabled="selectedStudents.length === 0 || enrolling"
              class="btn btn-primary disabled:opacity-50"
            >
              {{ enrolling ? 'Enrolling...' : `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { subjectsService } from '@/services/api/subjects'
import { gradesService } from '@/services/api/grades'
import { studentsService } from '@/services/api/students'

const route = useRoute()
const router = useRouter()
const subject = ref(null)
const loading = ref(true)
const error = ref(null)
const weights = ref({
  activity_weight: 30,
  quiz_weight: 30,
  exam_weight: 40
})
const assessments = ref([])
const showAddAssessmentModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const assessmentForm = ref({
  name: '',
  assessment_type: 'activity',
  max_score: '',
  date: '',
  subject: ''
})

const loadSubject = async () => {
  if (!route.params.id) {
    error.value = 'Subject ID is required'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const response = await subjectsService.getSubjectDetail(route.params.id)
    subject.value = response
    
    // Load existing weights if available
    if (response.grade_weights) {
      weights.value = response.grade_weights
    }
  } catch (err) {
    console.error('Error loading subject:', err)
    error.value = err.response?.data?.error || 'Failed to load subject details'
  } finally {
    loading.value = false
  }
}

const loadAssessments = async () => {
  try {
    const response = await gradesService.getAssessments(route.params.id)
    assessments.value = response
  } catch (error) {
    console.error('Error loading assessments:', error)
  }
}

const isValidWeights = computed(() => {
  const total = parseFloat(weights.value.activity_weight) + 
                parseFloat(weights.value.quiz_weight) + 
                parseFloat(weights.value.exam_weight)
  return Math.abs(total - 100) < 0.01
})

const saveWeights = async () => {
    if (!isValidWeights.value) {
        alert('Weights must total 100%');
        return;
    }
    
    try {
        loading.value = true;
        await subjectsService.updateGradeWeights(route.params.id, {
            activity_weight: parseFloat(weights.value.activity_weight),
            quiz_weight: parseFloat(weights.value.quiz_weight),
            exam_weight: parseFloat(weights.value.exam_weight)
        });
        alert('Grade weights updated successfully');
    } catch (error) {
        console.error('Error updating weights:', error);
        alert(error.response?.data?.error || 'Failed to update grade weights');
    } finally {
        loading.value = false;
    }
}

const saveAssessment = async () => {
  saving.value = true
  try {
    const formData = {
      ...assessmentForm.value,
      subject: route.params.id
    }
    
    if (isEditing.value) {
      await gradesService.updateAssessment(formData.id, formData)
    } else {
      await gradesService.createAssessment(formData)
    }
    
    await loadAssessments()
    closeAssessmentModal()
  } catch (error) {
    console.error('Error saving assessment:', error)
    alert('Failed to save assessment')
  } finally {
    saving.value = false
  }
}

const editAssessment = (assessment) => {
  assessmentForm.value = { ...assessment }
  isEditing.value = true
  showAddAssessmentModal.value = true
}

const deleteAssessment = async (id) => {
  if (!confirm('Are you sure you want to delete this assessment? This will also delete all associated grades.')) {
    return
  }
  
  try {
    await gradesService.deleteAssessment(id)
    await loadAssessments()
  } catch (error) {
    console.error('Error deleting assessment:', error)
    alert('Failed to delete assessment')
  }
}

const closeAssessmentModal = () => {
  showAddAssessmentModal.value = false
  isEditing.value = false
  assessmentForm.value = {
    name: '',
    assessment_type: 'activity',
    max_score: '',
    date: '',
    subject: ''
  }
}

const formatPrerequisites = (prerequisites) => {
  return prerequisites.map(p => `${p.code} - ${p.name}`).join(', ')
}

// Enrollment state
const showEnrollModal = ref(false)
const studentSearch = ref('')
const allStudents = ref([])
const filteredStudents = ref([])
const selectedStudents = ref([])
const enrolling = ref(false)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const goBack = () => {
  router.push('/subjects')
}

const loadAllStudents = async () => {
  try {
    const response = await studentsService.getStudents()
    allStudents.value = response.results || response
    filteredStudents.value = [...allStudents.value]
  } catch (error) {
    console.error('Error loading students:', error)
  }
}

const searchStudents = () => {
  if (!studentSearch.value.trim()) {
    filteredStudents.value = [...allStudents.value]
    return
  }
  
  const searchTerm = studentSearch.value.toLowerCase()
  filteredStudents.value = allStudents.value.filter(student => {
    return (
      student.student_id?.toLowerCase().includes(searchTerm) ||
      `${student.last_name} ${student.first_name} ${student.middle_name || ''}`.toLowerCase().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm) ||
      student.contact_number?.includes(searchTerm)
    )
  })
}

const enrollStudents = async () => {
  if (selectedStudents.value.length === 0) {
    alert('Please select at least one student to enroll')
    return
  }
  
  enrolling.value = true
  
  try {
    // Convert IDs to numbers and validate
    const subjectId = Number(route.params.id)
    if (isNaN(subjectId)) {
      throw new Error('Invalid subject ID')
    }
    
    console.log(`Starting enrollment for subject ${subjectId} with students:`, selectedStudents.value)
    
    // Process enrollments one by one to handle errors individually
    const results = []
    for (const studentId of selectedStudents.value) {
      try {
        const studentIdNum = Number(studentId)
        if (isNaN(studentIdNum)) {
          throw new Error(`Invalid student ID: ${studentId}`)
        }
        
        console.log(`Enrolling student ${studentIdNum} in subject ${subjectId}`)
        
        const enrollmentData = {
          student_id: studentIdNum,
          subject_id: subjectId
        }
        
        console.log('Sending enrollment data:', JSON.stringify(enrollmentData, null, 2))
        
        const response = await subjectsService.enrollStudent(enrollmentData)
        
        console.log('Enrollment response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers
        })
        
        results.push({
          studentId: studentIdNum,
          success: true,
          data: response.data
        })
        
        console.log(`Successfully enrolled student ${studentIdNum}`, response.data)
      } catch (error) {
        console.error(`Failed to enroll student ${studentId}:`, error)
        
        const errorData = error.response?.data || { error: error.message }
        results.push({
          studentId: studentId,
          success: false,
          error: errorData
        })
        
        // Show error but continue with other enrollments
        let errorMessage = errorData.error || errorData.detail || 'Failed to enroll student'
        
        // Special handling for already enrolled students
        if (errorMessage.includes('already enrolled')) {
          const student = allStudents.value.find(s => s.id === studentId)
          errorMessage = `${student?.first_name || 'Student'} is already enrolled in this subject`
        }
        
        // Don't show alert for already enrolled students
        if (!errorMessage.includes('already enrolled')) {
          alert(`Error: ${errorMessage}`)
        }
      }
    } // Close the for loop
    
    // Check results
    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length
    const duplicateEnrollments = results.filter(r => 
      !r.success && r.error?.error?.includes('already enrolled')
    )
    
    // Refresh subject data to show updated enrollment count if any enrollments were successful
    if (successCount > 0) {
      await loadSubject()
    }
    
    // Show appropriate message based on results
    if (successCount > 0 && errorCount === 0) {
      alert(`✅ Successfully enrolled ${successCount} student(s)`)
    } else if (successCount > 0) {
      const message = [
        `✅ Successfully enrolled ${successCount} student(s)`,
        duplicateEnrollments.length > 0 ? 
          `\nℹ️ ${duplicateEnrollments.length} student(s) were already enrolled` : 
          `\n❌ ${errorCount} enrollment(s) failed`
      ].join('')
      alert(message)
    } else if (duplicateEnrollments.length > 0) {
      alert(`ℹ️ ${duplicateEnrollments.length} student(s) were already enrolled in this subject`)
    } else if (errorCount > 0) {
      alert(`❌ Failed to enroll any students. Please check the error messages and try again.`)
    }
    
    // Close modal if we had any successful enrollments or if all failed
    if (successCount > 0 || errorCount > 0) {
      closeEnrollModal()
    }
    
  } catch (error) {
    console.error('Unexpected error in enrollStudents:', error)
    
    let errorMessage = 'An unexpected error occurred'
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      })
      
      errorMessage = error.response.data?.error || 
                   error.response.data?.detail || 
                   `Server responded with status ${error.response.status}`
    } else if (error.request) {
      console.error('No response received:', error.request)
      errorMessage = 'No response from server. Please check your connection.'
    } else {
      console.error('Error details:', error.message)
      errorMessage = error.message
    }
    
    alert(`Error: ${errorMessage}`)
  } finally {
    enrolling.value = false
  }
}

const closeEnrollModal = () => {
  showEnrollModal.value = false
  studentSearch.value = ''
  selectedStudents.value = []
  if (allStudents.value.length > 0) {
    filteredStudents.value = [...allStudents.value]
  }
}

onMounted(async () => {
  await Promise.all([
    loadSubject(),
    loadAssessments(),
    loadAllStudents()
  ])
})
</script>