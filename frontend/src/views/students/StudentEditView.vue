<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-brand">Edit Student</h1>
          <p class="text-muted mt-2">Update student information</p>
        </div>
        <button @click="$router.back()" class="btn btn-secondary">
          Cancel
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg mb-6">
        {{ error }}
      </div>

      <!-- Student Form -->
      <div class="card p-6">
        <form @submit.prevent="saveStudent">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Student ID -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-muted">Student ID</label>
              <input
                v-model="formData.student_id"
                type="text"
                required
                class="input"
                :disabled="loading"
              >
            </div>

            <!-- First Name -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-muted">First Name</label>
              <input
                v-model="formData.first_name"
                type="text"
                required
                class="input"
                :disabled="loading"
              >
            </div>


            <!-- Last Name -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-muted">Last Name</label>
              <input
                v-model="formData.last_name"
                type="text"
                required
                class="input"
                :disabled="loading"
              >
            </div>


            <!-- Email -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-muted">Email</label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="input"
                :disabled="loading"
              >
            </div>


            <!-- Date of Birth -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-muted">Date of Birth</label>
              <input
                v-model="formData.date_of_birth"
                type="date"
                required
                class="input"
                :disabled="loading"
              >
            </div>


            <!-- Section -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-muted">Section</label>
              <select
                v-model="formData.section"
                class="input"
                :disabled="loading || sectionsLoading"
                required
              >
                <option v-for="section in sections" :key="section.id" :value="section.id">
                  {{ formatSection(section) }}
                </option>
              </select>
            </div>
          </div>


          <!-- Form Actions -->
          <div class="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              @click="$router.back()"
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
              <span v-if="loading" class="inline-block animate-spin mr-2">⟳</span>
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studentsService } from '@/services/api/students'

const route = useRoute()
const router = useRouter()

const formData = ref({
  student_id: '',
  first_name: '',
  last_name: '',
  email: '',
  date_of_birth: '',
  section: ''
})

const sections = ref([])
const sectionsLoading = ref(false)
const loading = ref(false)
const error = ref(null)

const loadStudent = async () => {
  if (!route.params.id) {
    error.value = 'Student ID is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    const student = await studentsService.getStudent(route.params.id)
    formData.value = {
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      date_of_birth: student.date_of_birth,
      section: student.section?.id || ''
    }
  } catch (err) {
    console.error('Error loading student:', err)
    error.value = err.response?.data?.error || 'Failed to load student details'
  } finally {
    loading.value = false
  }
}

const loadSections = async () => {
  sectionsLoading.value = true
  try {
    sections.value = await studentsService.getSections()
  } catch (err) {
    console.error('Error loading sections:', err)
    error.value = 'Failed to load sections'
  } finally {
    sectionsLoading.value = false
  }
}

const saveStudent = async () => {
  if (!route.params.id) {
    error.value = 'Student ID is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    // Create a copy of form data to avoid modifying the original
    const studentData = { ...formData.value }
    
    // If section is being updated, use the assignToSection endpoint
    if (studentData.section) {
      // First update the student's basic info
      const { section, ...basicInfo } = studentData
      if (Object.keys(basicInfo).length > 0) {
        await studentsService.updateStudent(route.params.id, basicInfo)
      }
      
      // Then assign the section
      await studentsService.assignToSection(route.params.id, section)
    } else {
      // If no section change, just update the student
      await studentsService.updateStudent(route.params.id, studentData)
    }
    
    router.push({ name: 'student-detail', params: { id: route.params.id } })
  } catch (err) {
    console.error('Error updating student:', err)
    error.value = err.response?.data?.error || 'Failed to update student'
  } finally {
    loading.value = false
  }
}

const formatSection = (section) => {
  if (!section) return 'Not Assigned'
  return `Year ${section.year_level} - ${section.name}`
}

onMounted(async () => {
  await Promise.all([
    loadStudent(),
    loadSections()
  ])
})
</script>
