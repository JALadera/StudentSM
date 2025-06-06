<template>
  <div class="relative top-20 mx-auto p-6 border w-[800px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
    <h2 class="text-xl font-semibold text-red-600 mb-6">Bulk Subject Enrollment</h2>
    
    <div class="space-y-6">
      <!-- Success Message -->
      <div v-if="success" class="p-4 bg-green-900/30 text-green-400 rounded-lg">
        Successfully enrolled students from {{ selectedSections.length }} section(s)!
      </div>

      <!-- Subject Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-2">Target Subject</label>
        <select
          v-model="selectedSubject"
          required
          class="w-full p-2 rounded-md bg-[#141414] border border-gray-700 text-gray-200 focus:ring-2 focus:ring-red-600 focus:border-transparent"
          :disabled="loading"
        >
          <option value="">Select Subject</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.code }} - {{ subject.name }}
          </option>
        </select>
      </div>

      <!-- Section Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-2">Select Sections</label>
        <div class="space-y-3 max-h-60 overflow-y-auto p-4 bg-[#141414] rounded-lg border border-gray-800">
          <div v-if="sectionsLoading" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          </div>
          <template v-else>
            <div v-for="section in sections" :key="section.id" class="flex items-center space-x-3">
              <input
                type="checkbox"
                :id="`section-${section.id}`"
                v-model="selectedSections"
                :value="section.id"
                :disabled="loading"
                class="h-4 w-4 text-red-600 focus:ring-red-600 bg-[#1a1a1a] border-gray-700 rounded"
              >
              <label :for="`section-${section.id}`" class="text-gray-200">
                Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
              </label>
            </div>
            <p v-if="sections.length === 0" class="text-gray-400 text-sm italic">
              No sections available
            </p>
          </template>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="selectedSections.length > 0" class="p-4 bg-[#141414] rounded-lg border border-gray-800">
        <p class="text-sm text-gray-400">
          Students from {{ selectedSections.length }} section(s) will be enrolled in the selected subject
        </p>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg border border-red-900/50">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-4 pt-2">
        <button
          @click="$emit('close')"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ success ? 'Close' : 'Cancel' }}
        </button>
        <button
          v-if="!success"
          @click="handleBulkEnroll"
          :disabled="!canSubmit || loading"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Enrolling...' : 'Enroll Students' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { subjectsService } from '@/services/api/subjects'
import { studentsService } from '@/services/api/students'
import { formatOrdinal } from '@/utils/formatters'

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const sectionsLoading = ref(false)
const error = ref('')
const success = ref(false)
const subjects = ref([])
const sections = ref([])
const selectedSubject = ref('')
const selectedSections = ref([])

const canSubmit = computed(() => {
  return selectedSubject.value && selectedSections.value.length > 0
})

const loadData = async () => {
  try {
    sectionsLoading.value = true
    error.value = ''
    
    const [subjectsData, sectionsData] = await Promise.all([
      subjectsService.getSubjectList().catch(err => {
        console.error('Error loading subjects:', err)
        return []
      }),
      studentsService.getSections().catch(err => {
        console.error('Error loading sections:', err)
        return []
      })
    ])
    
    subjects.value = Array.isArray(subjectsData) ? subjectsData : []
    sections.value = Array.isArray(sectionsData) ? sectionsData : []
    
    if (subjects.value.length === 0) {
      error.value = 'No subjects available. Please create a subject first.'
    }
    
    if (sections.value.length === 0) {
      error.value = error.value ? error.value + ' ' : ''
      error.value += 'No sections available. Please create sections first.'
    }
  } catch (error) {
    console.error('Error loading data:', error)
    error.value = 'Failed to load required data. Please try again.'
  } finally {
    sectionsLoading.value = false
  }
}

const handleBulkEnroll = async () => {
  if (!canSubmit.value) return

  loading.value = true
  error.value = ''
  success.value = false

  try {
    console.log('Sending bulk enroll request with data:', {
      subjectId: selectedSubject.value,
      sectionIds: selectedSections.value
    })
    
    const response = await subjectsService.bulkEnrollStudents(selectedSubject.value, {
      section_ids: selectedSections.value
    })
    
    console.log('Bulk enroll response:', response)
    
    if (response) {
      success.value = true
      emit('success')
      // Auto-close after 2 seconds
      setTimeout(() => {
        if (success.value) {  // Only close if still successful (user didn't click close manually)
          emit('close')
        }
      }, 2000)
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (err) {
    console.error('Error enrolling students:', {
      error: err,
      response: err.response,
      data: err.response?.data,
      status: err.response?.status,
      statusText: err.response?.statusText,
      headers: err.response?.headers
    })
    error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to enroll students. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>