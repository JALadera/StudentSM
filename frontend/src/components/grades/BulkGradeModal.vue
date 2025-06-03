<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-6 border w-[800px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
      <h2 class="text-xl font-semibold text-red-600 mb-6">Bulk Grade Update</h2>
      
      <!-- Assessment Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-400 mb-2">Assessment</label>
        <select
          v-model="selectedAssessment"
          required
          class="w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
        >
          <option value="">Select Assessment</option>
          <option v-for="assessment in assessments" :key="assessment.id" :value="assessment.id">
            {{ assessment.name }} ({{ assessment.subject_name }})
          </option>
        </select>
      </div>

      <!-- Student Grades -->
      <div v-if="selectedAssessment" class="space-y-4 mb-6">
        <div v-for="grade in grades" :key="grade.student_id" class="p-4 bg-[#141414] rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-gray-200">{{ grade.student_name }}</p>
              <p class="text-sm text-gray-400">ID: {{ grade.student_id }}</p>
            </div>
            <div class="w-32">
              <input
                v-model="grade.score"
                type="number"
                :max="selectedAssessmentDetails?.max_score"
                min="0"
                step="0.01"
                class="w-full bg-[#1a1a1a] border-gray-800 text-gray-200 rounded-md"
              />
            </div>
          </div>
        </div>
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
          @click="handleBulkUpdate"
          :disabled="!canSubmit || loading"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Update Grades' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { gradesService } from '@/services/api/grades'

const emit = defineEmits(['close', 'success'])
const loading = ref(false)
const assessments = ref([])
const selectedAssessment = ref('')
const grades = ref([])
const selectedAssessmentDetails = ref(null)

const loadAssessments = async () => {
  try {
    assessments.value = await gradesService.getAllAssessments()
  } catch (error) {
    console.error('Error loading assessments:', error)
  }
}

watch(selectedAssessment, async (newValue) => {
  if (newValue) {
    try {
      const [assessmentDetails, enrolledStudents] = await Promise.all([
        gradesService.getAssessmentDetails(newValue),
        gradesService.getEnrolledStudents(newValue)
      ])
      
      selectedAssessmentDetails.value = assessmentDetails
      grades.value = enrolledStudents.map(student => ({
        student_id: student.id,
        student_name: student.full_name,
        score: student.existing_grade || 0
      }))
    } catch (error) {
      console.error('Error loading assessment details:', error)
    }
  }
})

const canSubmit = computed(() => {
  return selectedAssessment.value && grades.value.length > 0 &&
    grades.value.every(grade => 
      grade.score >= 0 && 
      grade.score <= selectedAssessmentDetails.value?.max_score
    )
})

const handleBulkUpdate = async () => {
  if (!canSubmit.value) return

  loading.value = true
  try {
    await gradesService.bulkUpdateGrades(selectedAssessment.value, grades.value)
    emit('success')
    emit('close')
  } catch (error) {
    console.error('Error updating grades:', error)
    alert('Failed to update grades')
  } finally {
    loading.value = false
  }
}

onMounted(loadAssessments)
</script>