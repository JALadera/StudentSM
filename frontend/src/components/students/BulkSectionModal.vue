<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-6 border w-[800px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
      <h2 class="text-xl font-semibold text-red-600 mb-6">Bulk Section Assignment</h2>
      
      <div class="mb-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Target Section</label>
          <select
            v-model="selectedSection"
            required
            class="w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
          >
            <option value="">Select Section</option>
            <option v-for="section in sections" :key="section.id" :value="section.id">
              Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Student List (CSV)</label>
          <input
            type="file"
            accept=".csv"
            @change="handleFileUpload"
            class="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-red-600 file:text-white
              hover:file:bg-red-700"
          />
          <p class="mt-2 text-sm text-gray-400">Upload a CSV file with student IDs</p>
        </div>
      </div>

      <div class="flex justify-end space-x-4">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
        >
          Cancel
        </button>
        <button
          @click="handleBulkAssign"
          :disabled="!file || !selectedSection || loading"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Assign Section' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { studentsService } from '@/services/api/students'
import { formatOrdinal } from '@/utils/formatters'

const emit = defineEmits(['close', 'success'])
const file = ref(null)
const loading = ref(false)
const sections = ref([])
const selectedSection = ref('')

const loadSections = async () => {
  try {
    sections.value = await studentsService.getSections()
  } catch (error) {
    console.error('Error loading sections:', error)
  }
}

const handleFileUpload = (event) => {
  file.value = event.target.files[0]
}

const handleBulkAssign = async () => {
  if (!file.value || !selectedSection.value) return

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    formData.append('section_id', selectedSection.value)
    await studentsService.bulkAssignSection(formData)
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Error assigning sections:', error)
    alert('Failed to assign sections')
  } finally {
    loading.value = false
  }
}

onMounted(loadSections)
</script>