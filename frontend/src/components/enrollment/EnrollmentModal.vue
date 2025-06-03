<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-6 border w-[480px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
      <div class="mt-2">
        <h3 class="text-xl font-medium text-gray-200 mb-6">
          Enroll in Subjects
        </h3>
        
        <div v-if="error" class="mb-4 p-4 bg-red-900/30 text-red-400 rounded-md">
          {{ error }}
        </div>

        <form @submit.prevent="handleEnroll" class="space-y-6">
          <div class="space-y-4">
            <div v-for="subject in availableSubjects" :key="subject.id" 
                 class="flex items-center p-3 bg-[#242424] rounded-md">
              <input
                type="checkbox"
                :value="subject.id"
                v-model="selectedSubjects"
                :id="'subject-' + subject.id"
                class="h-4 w-4 text-red-600 focus:ring-red-600 bg-[#141414] border-gray-800 rounded"
              >
              <label :for="'subject-' + subject.id" class="ml-3 block text-sm text-gray-300">
                <span class="font-medium">{{ subject.code }} - {{ subject.name }}</span>
                <span class="text-gray-500 text-xs block">{{ subject.units }} units</span>
              </label>
            </div>
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
              :disabled="loading || selectedSubjects.length === 0"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {{ loading ? 'Enrolling...' : `Enroll in ${selectedSubjects.length} subject(s)` }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { subjectsService } from '@/services/api/subjects'

const props = defineProps({
  show: Boolean,
  studentId: {
    type: [Number, String],
    required: true
  },
  yearLevel: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'enrolled'])

const loading = ref(false)
const error = ref('')
const availableSubjects = ref([])
const selectedSubjects = ref([])

const loadSubjects = async () => {
  try {
    const subjects = await subjectsService.getSubjectList()
    // Filter subjects by year level and remove already enrolled ones
    availableSubjects.value = subjects.filter(subject => 
      subject.year_level <= props.yearLevel
    )
  } catch (err) {
    console.error('Error loading subjects:', err)
    error.value = 'Failed to load available subjects'
  }
}

const handleEnroll = async () => {
  if (selectedSubjects.value.length === 0) return
  
  error.value = ''
  loading.value = true
  
  try {
    await Promise.all(
      selectedSubjects.value.map(subjectId =>
        subjectsService.enrollStudent(subjectId, props.studentId)
      )
    )
    emit('enrolled')
    close()
  } catch (err) {
    console.error('Error enrolling student:', err)
    error.value = err.response?.data?.error || 'Failed to enroll student'
  } finally {
    loading.value = false
  }
}

const close = () => {
  selectedSubjects.value = []
  error.value = ''
  emit('close')
}

onMounted(loadSubjects)
</script>