<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-6 border w-[480px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
      <div class="mt-2">
        <h3 class="text-xl font-medium text-gray-200 mb-6">
          Change Section
        </h3>
        
        <div v-if="error" class="mb-4 p-4 bg-red-900/30 text-red-400 rounded-md">
          {{ error }}
        </div>

        <form @submit.prevent="handleChangeSection" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-400">New Section</label>
            <select
              v-model="selectedSection"
              required
              class="mt-1 block w-full bg-[#141414] border-gray-800 text-gray-300 rounded-md px-3 py-2 focus:border-red-600 focus:ring-red-600"
            >
              <option value="">Select Section</option>
              <option v-for="section in sections" :key="section.id" :value="section.id">
                Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
              </option>
            </select>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatOrdinal } from '@/utils/formatters'

const props = defineProps({
  show: Boolean,
  sections: {
    type: Array,
    required: true
  },
  currentSectionId: Number
})

const emit = defineEmits(['close', 'update'])

const selectedSection = ref('')
const loading = ref(false)
const error = ref('')

const handleChangeSection = async () => {
  if (!selectedSection.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    emit('update', selectedSection.value)
    close()
  } catch (err) {
    error.value = err.message || 'Failed to change section'
  } finally {
    loading.value = false
  }
}

const close = () => {
  selectedSection.value = ''
  error.value = ''
  emit('close')
}
</script>