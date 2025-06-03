<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-6 border w-[800px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
      <h2 class="text-xl font-semibold text-red-600 mb-6">Bulk Register Students</h2>
      
      <div class="space-y-4 mb-6">
        <div v-for="(student, index) in students" :key="index" class="p-4 bg-[#141414] rounded-lg">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Student ID *</label>
              <input
                v-model="student.student_id"
                type="text"
                required
                class="w-full bg-[#1a1a1a] border-gray-800 text-gray-200 rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">First Name *</label>
              <input
                v-model="student.first_name"
                type="text"
                required
                class="w-full bg-[#1a1a1a] border-gray-800 text-gray-200 rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Last Name *</label>
              <input
                v-model="student.last_name"
                type="text"
                required
                class="w-full bg-[#1a1a1a] border-gray-800 text-gray-200 rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Email *</label>
              <input
                v-model="student.email"
                type="email"
                required
                class="w-full bg-[#1a1a1a] border-gray-800 text-gray-200 rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Date of Birth *</label>
              <input
                v-model="student.date_of_birth"
                type="date"
                required
                class="w-full bg-[#1a1a1a] border-gray-800 text-gray-200 rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Section *</label>
              <select
                v-model="student.section"
                required
                class="w-full bg-[#1a1a1a] border-gray-800 text-gray-200 rounded-md"
              >
                <option value="">Select Section</option>
                <option v-for="section in sections" :key="section.id" :value="section.id">
                  Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
                </option>
              </select>
            </div>
          </div>
          <div class="flex justify-end mt-2">
            <button 
              @click="removeStudent(index)"
              class="text-red-500 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-4 p-4 bg-red-900/30 text-red-400 rounded-lg">
        {{ error }}
      </div>

      <!-- Add More Button -->
      <button
        @click="addStudent"
        class="mb-6 px-4 py-2 text-sm font-medium text-gray-200 bg-[#242424] rounded-md hover:bg-[#2a2a2a] transition-colors"
      >
        + Add Another Student
      </button>

      <div class="flex justify-end space-x-4">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
        >
          Cancel
        </button>
        <button
          @click="handleBulkRegister"
          :disabled="!isValid || loading"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Register Students' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { studentsService } from '@/services/api/students'
import { formatOrdinal } from '@/utils/formatters'

const emit = defineEmits(['close', 'success'])
const loading = ref(false)
const error = ref('')
const sections = ref([])

const students = ref([
  createEmptyStudent()
])

function createEmptyStudent() {
  return {
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    section: ''
  }
}

const loadSections = async () => {
  try {
    sections.value = await studentsService.getSections()
  } catch (err) {
    console.error('Error loading sections:', err)
    error.value = 'Failed to load sections'
  }
}

const addStudent = () => {
  students.value.push(createEmptyStudent())
}

const removeStudent = (index) => {
  if (students.value.length > 1) {
    students.value.splice(index, 1)
  }
}

const isValid = computed(() => {
  return students.value.every(student => 
    student.student_id && 
    student.first_name && 
    student.last_name && 
    student.email &&
    student.date_of_birth &&
    student.section
  )
})

const handleBulkRegister = async () => {
  if (!isValid.value) return
  error.value = ''
  loading.value = true

  try {
    await studentsService.bulkRegisterStudents({
      students: students.value.map(student => ({
        ...student,
        section: parseInt(student.section)
      }))
    })
    emit('success')
    emit('close')
  } catch (err) {
    console.error('Error bulk registering students:', err)
    error.value = err.message || 'Failed to register students'
  } finally {
    loading.value = false
  }
}

onMounted(loadSections)
</script>