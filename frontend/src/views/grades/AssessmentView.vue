<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-brand">Assessments</h1>
        <p class="text-muted mt-2">Manage student assessments and grades</p>
      </div>

      <!-- Assessment Types Tabs -->
      <div class="mb-6">
        <div class="border-b border-theme">
          <nav class="flex -mb-px">
            <button 
              v-for="type in ['Activities', 'Quizzes', 'Exams']" 
              :key="type"
              @click="activeTab = type.toLowerCase()"
              :class="[
                activeTab === type.toLowerCase() 
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:text-base hover:border-theme',
                'w-1/3 py-4 px-1 text-center border-b-2 font-medium theme-transition'
              ]"
            >
              {{ type }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Assessment List -->
      <div class="card">
        <div class="flex justify-end p-4 border-b border-theme">
          <button
            @click="showAddModal = true"
            class="btn btn-primary"
          >
            Add New {{ activeTab.slice(0, -1) }}
          </button>
        </div>

        <!-- Assessment Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-theme">
            <thead class="bg-base">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Subject</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Max Score</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-theme">
              <tr v-for="assessment in filteredAssessments" :key="assessment.id" 
                  class="hover:bg-elevated theme-transition">
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ assessment.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ assessment.subject }}</td>
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
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[480px] shadow-lg rounded-lg bg-elevated border-theme">
          <h3 class="text-xl font-medium text-base mb-6">
            {{ isEditing ? 'Edit' : 'Add New' }} {{ activeTab.slice(0, -1) }}
          </h3>
          <form @submit.prevent="saveAssessment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Subject</label>
              <select
                v-model="form.subject_id"
                required
                class="input w-full"
                :disabled="loading"
              >
                <option value="" disabled>Select a subject</option>
                <option 
                  v-for="subject in subjects" 
                  :key="subject.id" 
                  :value="subject.id"
                >
                  {{ subject.code }} - {{ subject.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-muted mb-1">Assessment Type</label>
              <select
                v-model="form.type"
                required
                class="input w-full"
              >
                <option value="activity">Activity</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-muted mb-1">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input w-full"
                placeholder="e.g., Midterm Exam, Chapter 1 Quiz"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-muted mb-1">Max Score</label>
                <input
                  v-model="form.max_score"
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  class="input w-full"
                  placeholder="100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-muted mb-1">Date</label>
                <input
                  v-model="form.date"
                  type="date"
                  required
                  class="input w-full"
                />
              </div>
            </div>

            <div v-if="error" class="text-red-500 text-sm mt-2">
              {{ error }}
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary"
                :disabled="loading"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="inline-block animate-spin mr-2">
                  <svg class="h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isEditing ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gradesService } from '@/services/api/grades'
import { subjectsService } from '@/services/api/subjects'

const route = useRoute()
const router = useRouter()
const activeTab = ref('activities')
const showAddModal = ref(false)
const isEditing = ref(false)
const assessments = ref([])
const subjects = ref([])
const loading = ref(false)
const error = ref('')

// Form state
const form = ref({
  name: '',
  max_score: '',
  date: new Date().toISOString().split('T')[0],
  subject_id: '',
  type: 'activity' // Default type
})

const filteredAssessments = computed(() => {
  return assessments.value.filter(a => a.type === activeTab.value)
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const loadSubjects = async () => {
  try {
    loading.value = true
    error.value = ''
    console.log('Fetching subjects...')
    const response = await subjectsService.getAllSubjects()
    console.log('Subjects loaded:', response)
    
    if (response && Array.isArray(response)) {
      subjects.value = response
      
      // If there's a subjectId in the URL, set it in the form
      if (route.query.subjectId) {
        form.value.subject_id = route.query.subjectId
      } else if (subjects.value.length > 0) {
        // Otherwise, select the first subject by default
        form.value.subject_id = subjects.value[0]?.id || ''
      }
    } else {
      console.error('Unexpected response format:', response)
      error.value = 'Failed to load subjects. Invalid response format.'
    }
  } catch (err) {
    console.error('Error loading subjects:', err)
    error.value = 'Failed to load subjects. Please try again.'
  } finally {
    loading.value = false
  }
}

const loadAssessments = async () => {
  try {
    loading.value = true
    const response = await gradesService[`get${activeTab.value.charAt(0).toUpperCase() + activeTab.value.slice(1)}`]()
    assessments.value = response
  } catch (err) {
    console.error('Error loading assessments:', err)
    error.value = 'Failed to load assessments. Please try again.'
  } finally {
    loading.value = false
  }
}

const saveAssessment = async () => {
  try {
    if (!form.value.subject_id) {
      error.value = 'Please select a subject'
      return
    }
    
    const assessmentData = {
      name: form.value.name,
      subject: form.value.subject_id, // Use subject_id as the subject field
      max_score: Number(form.value.max_score),
      date: form.value.date,
      assessment_type: form.value.type // Changed from 'type' to 'assessment_type' to match backend
    }
    
    console.log('Saving assessment:', assessmentData)
    
    if (isEditing.value) {
      await gradesService.updateAssessment(assessmentData.id, assessmentData)
    } else {
      await gradesService.createAssessment(assessmentData)
    }
    
    await loadAssessments()
    showAddModal.value = false
    resetForm()
    error.value = ''
    
    // Redirect to subject detail page
    if (route.query.redirectToSubject) {
      router.push({ name: 'SubjectDetail', params: { id: assessmentData.subject } })
    }
  } catch (err) {
    console.error('Error saving assessment:', err)
    error.value = err.response?.data?.error || 'Failed to save assessment. Please try again.'
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    max_score: '',
    date: new Date().toISOString().split('T')[0],
    subject_id: route.query.subjectId || (subjects.value[0]?.id || ''),
    type: activeTab.value.slice(0, -1)
  }
}

const editAssessment = (assessment) => {
  isEditing.value = true
  form.value = { ...assessment }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  error.value = ''
  resetForm()
}

const deleteAssessment = async (id) => {
  if (!confirm('Are you sure you want to delete this assessment?')) return
  
  try {
    await gradesService.deleteAssessment(id)
    await loadAssessments()
  } catch (err) {
    console.error('Error deleting assessment:', err)
    error.value = 'Failed to delete assessment. Please try again.'
  }
}

watch(activeTab, // Watch for tab changes to load the correct assessments
() => {
  loadAssessments()
})

// Initialize the component
onMounted(async () => {
  try {
    console.log('Component mounted, loading data...')
    await Promise.all([
      loadSubjects(),
      loadAssessments()
    ])
    
    console.log('Subjects loaded:', subjects.value)
    
    // If there's a subjectId in the URL, open the add modal
    if (route.query.subjectId) {
      console.log('Subject ID from URL:', route.query.subjectId)
      showAddModal.value = true
    }
  } catch (error) {
    console.error('Error initializing component:', error)
    error.value = 'Failed to initialize component. Please refresh the page.'
  }
})
</script>