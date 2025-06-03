<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-brand">Subjects</h1>
        <p class="text-muted mt-2">Manage course subjects and prerequisites</p>
      </div>

      <!-- Actions -->
      <div class="mb-6">
        <button
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          Add New Subject
        </button>
      </div>

      <!-- Filter and Sort -->
      <div class="mb-6 flex space-x-4">
        <div class="w-64">
          <label class="block text-sm font-medium text-muted mb-2">Filter by Year</label>
          <select
            v-model="yearFilter"
            class="input"
          >
            <option value="">All Years</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
          </select>
        </div>
        
        <div class="w-64">
          <label class="block text-sm font-medium text-muted mb-2">Sort By</label>
          <select
            v-model="sortOption"
            class="input"
          >
            <option value="code">Code</option>
            <option value="name">Name</option>
            <option value="year_asc">Year (Low to High)</option>
            <option value="year_desc">Year (High to Low)</option>
            <option value="units">Units</option>
          </select>
        </div>
      </div>

      <!-- Subjects Table -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-theme">
            <thead class="bg-base">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Units</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Prerequisites</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-theme bg-secondary">
              <tr v-for="subject in filteredAndSortedSubjects" :key="subject.id" 
                  class="hover:bg-theme-light-hover dark:hover:bg-theme-dark-hover">
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ subject.code }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ subject.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ subject.units }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-base">
                  <span v-if="subject.prerequisites?.length > 0">
                    {{ formatPrerequisites(subject.prerequisites) }}
                  </span>
                  <span v-else class="text-muted">None</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-4">
                    <router-link
                      :to="`/subjects/${subject.id}`"
                      class="text-muted hover:text-base theme-transition"
                    >
                      View
                    </router-link>
                    <button 
                      @click="editSubject(subject)"
                      class="text-muted hover:text-base theme-transition"
                    >
                      Edit
                    </button>
                    <button 
                      @click="deleteSubject(subject.id)"
                      class="text-muted hover:text-base theme-transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No subjects found message -->
      <div v-if="filteredAndSortedSubjects.length === 0" class="card p-8 text-center">
        <p class="text-muted">No subjects found for the selected filters.</p>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[600px] shadow-lg rounded-lg bg-elevated border-theme">
          <h3 class="text-xl font-medium text-base mb-6">
            {{ isEditing ? 'Edit' : 'Add New' }} Subject
          </h3>
          
          <form @submit.prevent="saveSubject" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-muted">Subject Code</label>
                <input
                  v-model="form.code"
                  type="text"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-muted">Units</label>
                <input
                  v-model="form.units"
                  type="number"
                  required
                  min="1"
                  class="input"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted">Subject Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-muted">Year Level</label>
              <select v-model="form.year_level" required class="input">
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted">Prerequisites</label>
              <select
                v-model="form.prerequisites"
                multiple
                class="input"
              >
                <option
                  v-for="subject in availablePrerequisites"
                  :key="subject.id"
                  :value="subject.id"
                >
                  {{ subject.code }} - {{ subject.name }} (Year {{ subject.year_level }})
                </option>
              </select>
              <p class="mt-1 text-sm text-muted">
                Hold Ctrl/Cmd to select multiple subjects. Only subjects from same or lower year levels are available.
              </p>
            </div>

            <!-- Error message display -->
            <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg">
              {{ error }}
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
              >
                {{ isEditing ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { subjectsService } from '@/services/api/subjects'

const subjects = ref([])
const showAddModal = ref(false)
const isEditing = ref(false)
const error = ref('')
const form = ref({
  code: '',
  name: '',
  units: 3,
  year_level: 1,
  prerequisites: []
})
const yearFilter = ref('')
const sortOption = ref('code')

const resetForm = () => {
  form.value = {
    code: '',
    name: '',
    units: 3,
    year_level: 1,
    prerequisites: []
  }
  error.value = ''
  isEditing.value = false
}

const loadSubjects = async () => {
  try {
    subjects.value = await subjectsService.getSubjectList()
    console.log('Loaded subjects:', subjects.value) // Add for debugging
  } catch (error) {
    console.error('Error loading subjects:', error)
  }
}

const saveSubject = async () => {
  error.value = ''
  try {
    const subjectData = {
      ...form.value,
      units: parseInt(form.value.units),
      year_level: parseInt(form.value.year_level),
      prerequisites: form.value.prerequisites || [] // Ensure prerequisites is always an array
    }

    if (isEditing.value) {
      await subjectsService.updateSubject(form.value.id, subjectData)
    } else {
      await subjectsService.createSubject(subjectData)
    }
    
    await loadSubjects()
    showAddModal.value = false
    resetForm()
  } catch (err) {
    console.error('Error saving subject:', err)
    error.value = err.response?.data?.detail || 'Failed to save subject'
  }
}

const closeModal = () => {
  showAddModal.value = false
  resetForm() // Reset form when closing modal
}

const formatPrerequisites = (prerequisites) => {
  return prerequisites
    .map(p => p.code)
    .join(', ')
}

const editSubject = (subject) => {
  isEditing.value = true
  form.value = {
    ...subject,
    prerequisites: subject.prerequisites?.map(p => p.id) || []
  }
  showAddModal.value = true
}

const deleteSubject = async (id) => {
  if (!confirm('Are you sure you want to delete this subject?')) return
  
  try {
    await subjectsService.deleteSubject(id)
    await loadSubjects()
  } catch (error) {
    console.error('Error deleting subject:', error)
  }
}

// Add computed property for available prerequisites
const availablePrerequisites = computed(() => {
  // When editing, filter out the current subject and higher year levels
  if (isEditing.value) {
    return subjects.value.filter(s => 
      s.id !== form.value.id && 
      s.year_level <= form.value.year_level
    )
  }
  // When adding new, show subjects of same or lower year level
  return subjects.value.filter(s => 
    s.year_level <= (form.value.year_level || 1)
  )
})

// Watch for year level changes to update available prerequisites
watch(() => form.value.year_level, () => {
  // Clear prerequisites if they're no longer valid for the new year level
  form.value.prerequisites = form.value.prerequisites?.filter(id => 
    availablePrerequisites.value.some(s => s.id === id)
  ) || []
})

const filteredAndSortedSubjects = computed(() => {
  let result = [...subjects.value]
  
  // Apply year filter
  if (yearFilter.value) {
    result = result.filter(subject => 
      subject.year_level === parseInt(yearFilter.value)
    )
  }
  
  // Apply sorting
  result.sort((a, b) => {
    switch (sortOption.value) {
      case 'year_asc':
        return a.year_level - b.year_level
      case 'year_desc':
        return b.year_level - a.year_level
      case 'name':
        return a.name.localeCompare(b.name)
      case 'units':
        return a.units - b.units
      case 'code':
      default:
        return a.code.localeCompare(b.code)
    }
  })
  
  return result
})

onMounted(() => {
  loadSubjects()
})
</script>