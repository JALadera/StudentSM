<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-6 border w-[800px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
      <h2 class="text-xl font-semibold text-red-600 mb-6">Bulk Subject Enrollment</h2>
      
      <div class="space-y-6">
        <!-- Subject Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Target Subject</label>
          <select
            v-model="selectedSubject"
            required
            class="w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
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
          <div class="space-y-3 max-h-60 overflow-y-auto p-4 bg-[#141414] rounded-lg">
            <div v-for="section in sections" :key="section.id" 
                 class="flex items-center space-x-3">
              <input
                type="checkbox"
                :id="`section-${section.id}`"
                v-model="selectedSections"
                :value="section.id"
                class="h-4 w-4 text-red-600 focus:ring-red-600 bg-[#1a1a1a] border-gray-800 rounded"
              >
              <label :for="`section-${section.id}`" class="text-gray-200">
                Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
              </label>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="selectedSections.length > 0" class="p-4 bg-[#141414] rounded-lg">
          <p class="text-sm text-gray-400">
            Students from {{ selectedSections.length }} section(s) will be enrolled in the selected subject
          </p>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg">
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-4">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
          >
            Cancel
          </button>
          <button
            @click="handleBulkEnroll"
            :disabled="!canSubmit || loading"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ loading ? 'Processing...' : 'Enroll Students' }}
          </button>
        </div>
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
const error = ref('')
const subjects = ref([])
const sections = ref([])
const selectedSubject = ref('')
const selectedSections = ref([])

const canSubmit = computed(() => {
  return selectedSubject.value && selectedSections.value.length > 0
})

const loadData = async () => {
  try {
    const [subjectsData, sectionsData] = await Promise.all([
      subjectsService.getSubjectList(),
      studentsService.getSections()
    ])
    subjects.value = subjectsData
    sections.value = sectionsData
  } catch (error) {
    console.error('Error loading data:', error)
    error.value = 'Failed to load data'
  }
}

const handleBulkEnroll = async () => {
  if (!canSubmit.value) return

  loading.value = true
  error.value = ''

  try {
    await subjectsService.bulkEnrollStudents(selectedSubject.value, {
      section_ids: selectedSections.value
    })
    emit('success')
    emit('close')
  } catch (err) {
    console.error('Error enrolling students:', err)
    error.value = err.response?.data?.error || 'Failed to enroll students'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>