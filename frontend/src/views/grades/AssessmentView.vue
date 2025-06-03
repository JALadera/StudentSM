<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-brand">Assessments</h1>
        <p class="text-muted mt-2">Manage student assessments and grades</p>
      </div>

      <!-- Assessment Types Tabs -->
      <div class="mb-6">
        <div class="border-b border-theme">
          <nav class="flex -mb-px">
            <button 
              v-for="type in ['Activities', 'Quizzes', 'Exams']" 
              :key="type"
              @click="activeTab = type.toLowerCase()"
              :class="[
                activeTab === type.toLowerCase() 
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:text-base hover:border-theme',
                'w-1/3 py-4 px-1 text-center border-b-2 font-medium theme-transition'
              ]"
            >
              {{ type }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Assessment List -->
      <div class="card">
        <div class="flex justify-end p-4 border-b border-theme">
          <button
            @click="showAddModal = true"
            class="btn btn-primary"
          >
            Add New {{ activeTab.slice(0, -1) }}
          </button>
        </div>

        <!-- Assessment Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-theme">
            <thead class="bg-base">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Subject</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Max Score</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-theme">
              <tr v-for="assessment in filteredAssessments" :key="assessment.id" 
                  class="hover:bg-elevated theme-transition">
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ assessment.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ assessment.subject }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ assessment.max_score }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-base">{{ formatDate(assessment.date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button 
                    @click="editAssessment(assessment)"
                    class="text-muted hover:text-brand mr-3 theme-transition"
                  >
                    Edit
                  </button>
                  <button 
                    @click="deleteAssessment(assessment.id)"
                    class="text-muted hover:text-brand theme-transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[480px] shadow-lg rounded-lg bg-elevated border-theme">
          <h3 class="text-xl font-medium text-base mb-6">
            {{ isEditing ? 'Edit' : 'Add New' }} {{ activeTab.slice(0, -1) }}
          </h3>
          <form @submit.prevent="saveAssessment" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-muted">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-muted">Max Score</label>
              <input
                v-model="form.max_score"
                type="number"
                required
                min="0"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-muted">Date</label>
              <input
                v-model="form.date"
                type="date"
                required
                class="input"
              />
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
import { ref, computed, onMounted } from 'vue'
import { gradesService } from '@/services/api/grades'

const activeTab = ref('activities')
const showAddModal = ref(false)
const isEditing = ref(false)
const assessments = ref([])
const form = ref({
  name: '',
  max_score: '',
  date: ''
})

const filteredAssessments = computed(() => {
  return assessments.value.filter(a => a.type === activeTab.value)
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const loadAssessments = async () => {
  try {
    const response = await gradesService[`get${activeTab.value.charAt(0).toUpperCase() + activeTab.value.slice(1)}`]()
    assessments.value = response
  } catch (error) {
    console.error('Error loading assessments:', error)
  }
}

const saveAssessment = async () => {
  try {
    if (isEditing.value) {
      await gradesService.updateAssessment(form.value)
    } else {
      await gradesService[`create${activeTab.value.slice(0, -1)}`](form.value)
    }
    await loadAssessments()
    showAddModal.value = false
    form.value = { name: '', max_score: '', date: '' }
  } catch (error) {
    console.error('Error saving assessment:', error)
  }
}

const editAssessment = (assessment) => {
  isEditing.value = true
  form.value = { ...assessment }
  showAddModal.value = true
}

const deleteAssessment = async (id) => {
  if (!confirm('Are you sure you want to delete this assessment?')) return
  
  try {
    await gradesService.deleteAssessment(id)
    await loadAssessments()
  } catch (error) {
    console.error('Error deleting assessment:', error)
  }
}

onMounted(() => {
  loadAssessments()
})
</script>