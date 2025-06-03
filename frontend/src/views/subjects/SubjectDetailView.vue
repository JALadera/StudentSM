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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { subjectsService } from '@/services/api/subjects'
import { gradesService } from '@/services/api/grades'

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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const goBack = () => {
  router.push('/subjects')
}

onMounted(() => {
  loadSubject()
  loadAssessments()
})
</script>