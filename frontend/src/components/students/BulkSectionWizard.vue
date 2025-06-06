<template>
  <div class="relative top-20 mx-auto p-6 border w-[800px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
    <!-- Progress Steps -->
    <div class="flex justify-between mb-8">
      <div v-for="(step, index) in steps" :key="index" class="flex-1">
        <div 
          class="flex flex-col items-center"
          :class="{ 'cursor-pointer': currentStep > index }"
          @click="currentStep > index ? currentStep = index + 1 : null"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
            :class="[
              currentStep > index ? 'bg-green-600 text-white' : 
              currentStep === index ? 'bg-red-600 text-white' : 
              'bg-gray-700 text-gray-400'
            ]"
          >
            {{ index + 1 }}
          </div>
          <span 
            class="mt-2 text-xs text-center"
            :class="currentStep >= index ? 'text-white' : 'text-gray-500'"
          >
            {{ step }}
          </span>
        </div>
      </div>
    </div>

    <!-- Step 1: Select Students -->
    <div v-if="currentStep === 1" class="space-y-6">
      <h3 class="text-lg font-medium text-white mb-4">Select Students</h3>
      
      <div class="flex space-x-4 mb-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search students..."
            class="w-full px-4 py-2 rounded-md bg-[#141414] border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div class="w-48">
          <select
            v-model="filterYear"
            class="w-full px-4 py-2 rounded-md bg-[#141414] border border-gray-700 text-white"
          >
            <option value="">All Year Levels</option>
            <option v-for="year in [1, 2, 3, 4]" :key="year" :value="year">
              Year {{ year }}
            </option>
          </select>
        </div>
      </div>

      <div class="border border-gray-700 rounded-md overflow-hidden">
        <div class="max-h-96 overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <thead class="bg-[#1f1f1f]">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    :checked="allSelected"
                    @change="toggleSelectAll"
                    class="h-4 w-4 text-red-600 rounded border-gray-600 bg-gray-800 focus:ring-red-500"
                  >
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Current Section</th>
              </tr>
            </thead>
            <tbody class="bg-[#1a1a1a] divide-y divide-gray-800">
              <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-[#222222]">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    v-model="selectedStudents"
                    :value="student.id"
                    class="h-4 w-4 text-red-600 rounded border-gray-600 bg-gray-800 focus:ring-red-500"
                  >
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">
                    {{ student.last_name }}, {{ student.first_name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ student.student_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ student.section ? `Year ${student.section.year_level} - ${student.section.name}` : 'Not Assigned' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
        >
          Cancel
        </button>
        <button
          @click="currentStep++"
          :disabled="selectedStudents.length === 0"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Next: Select Section
        </button>
      </div>
    </div>

    <!-- Step 2: Select Section -->
    <div v-else-if="currentStep === 2" class="space-y-6">
      <h3 class="text-lg font-medium text-white mb-4">Assign Section</h3>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-400 mb-2">Select Section</label>
        <select
          v-model="selectedSection"
          required
          class="w-full px-4 py-2 rounded-md bg-[#141414] border border-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Select Section</option>
          <option v-for="section in sections" :key="section.id" :value="section.id">
            Year {{ section.year_level }} - {{ formatSectionName(section) }}
          </option>
        </select>
      </div>

      <div class="bg-[#1f1f1f] p-4 rounded-md">
        <h4 class="text-sm font-medium text-white mb-2">Summary</h4>
        <p class="text-sm text-gray-400">
          You are about to assign <span class="font-medium text-white">{{ selectedStudents.length }} students</span> to the selected section.
        </p>
      </div>

      <div class="flex justify-between mt-6">
        <button
          @click="currentStep--"
          class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
        >
          Back
        </button>
        <div class="space-x-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
          >
            Cancel
          </button>
          <button
            @click="confirmAssignment"
            :disabled="!selectedSection || processing"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ processing ? 'Processing...' : 'Confirm Assignment' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Confirmation -->
    <div v-else-if="currentStep === 3" class="text-center py-8">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="mt-3 text-lg font-medium text-white">Assignment Complete</h3>
      <p class="mt-2 text-sm text-gray-400">
        Successfully assigned {{ selectedStudents.length }} students to the selected section.
      </p>
      <div class="mt-6">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Done
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

// Wizard state
const currentStep = ref(1)
const steps = ['Select Students', 'Assign Section', 'Confirmation']

// Step 1: Student selection
const students = ref([])
const selectedStudents = ref([])
const searchQuery = ref('')
const filterYear = ref('')

// Step 2: Section selection
const sections = ref([])
const selectedSection = ref('')

// UI State
const processing = ref(false)

// Computed properties
const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesYear = !filterYear.value || 
      (student.section && student.section.year_level == filterYear.value)
    
    return matchesSearch && matchesYear
  })
})

const allSelected = computed({
  get: () => {
    return filteredStudents.value.length > 0 && 
      filteredStudents.value.every(student => selectedStudents.value.includes(student.id))
  },
  set: (value) => {
    if (value) {
      // Add all filtered students that aren't already selected
      const filteredIds = filteredStudents.value.map(s => s.id)
      const newSelections = [...new Set([...selectedStudents.value, ...filteredIds])]
      selectedStudents.value = newSelections
    } else {
      // Remove all filtered students from selection
      const filteredIds = filteredStudents.value.map(s => s.id)
      selectedStudents.value = selectedStudents.value.filter(id => !filteredIds.includes(id))
    }
  }
})

// Methods
const toggleSelectAll = () => {
  allSelected.value = !allSelected.value
}

const formatSectionName = (section) => {
  return `${formatOrdinal(section.name)} Section`
}

const confirmAssignment = async () => {
  if (!selectedSection.value || selectedStudents.value.length === 0) return
  
  processing.value = true
  
  try {
    await studentsService.bulkAssignSection({
      student_ids: selectedStudents.value,
      section_id: selectedSection.value
    })
    
    // Move to success step
    currentStep.value++
    emit('success')
  } catch (error) {
    console.error('Error assigning sections:', error)
    alert('Failed to assign sections. Please try again.')
  } finally {
    processing.value = false
  }
}

// Load data
const loadStudents = async () => {
  try {
    const response = await studentsService.getStudentList({ page_size: 1000 })
    students.value = response.results || []
  } catch (error) {
    console.error('Error loading students:', error)
  }
}

const loadSections = async () => {
  try {
    sections.value = await studentsService.getSections()
  } catch (error) {
    console.error('Error loading sections:', error)
  }
}

// Initialize
onMounted(() => {
  loadStudents()
  loadSections()
})
</script>
