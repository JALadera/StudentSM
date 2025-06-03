<!-- frontend/src/views/students/StudentListView.vue -->
<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-brand">Students</h1>
          <p class="text-muted mt-2">Manage student records and information</p>
        </div>
        <button @click="showAddModal = true" class="btn btn-primary">
          Add Student
        </button>
      </div>

      <!-- Filters -->
      <div class="card p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-muted mb-2">Section</label>
            <select v-model="filters.section" @change="loadStudents" class="input">
              <option value="">All Sections</option>
              <option v-for="section in sections" :key="section.id" :value="section.id">
                {{ formatSection(section) }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-muted mb-2">Search</label>
            <input
              v-model="searchTerm"
              @input="searchStudents"
              type="text"
              placeholder="Search by name or ID..."
              class="input"
            />
          </div>
          <!-- Sort By Filter -->
          <div>
            <label class="block text-sm font-medium text-muted mb-2">Sort By</label>
            <select v-model="sortOption" class="input">
              <option value="name">Name</option>
              <option value="id">Student ID</option>
              <option value="section">Section</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg mb-6">
        {{ error }}
      </div>

      <!-- Students Table -->
      <div class="card overflow-hidden">
        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600 mx-auto"></div>
          <p class="mt-4 text-muted">Loading students...</p>
        </div>
        
        <ul v-else-if="filteredStudents && filteredStudents.length > 0" class="divide-y divide-theme">
          <li v-for="student in filteredStudents" :key="student.id" 
              class="px-6 py-4 hover:bg-elevated theme-transition">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-12 w-12">
                  <div class="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">
                      {{ student.first_name.charAt(0) }}{{ student.last_name.charAt(0) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-lg font-medium text-base">
                    {{ student.full_name }}
                  </div>
                  <div class="text-sm text-muted">
                    ID: {{ student.student_id }} | {{ student.email }}
                  </div>
                  <div class="text-sm text-muted">
                    Section: {{ student.section ? formatSection(student.section) : 'Not assigned' }}
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <button @click="viewStudent(student)" 
                        class="text-muted hover:text-brand theme-transition">
                  View
                </button>
                <button @click="editStudent(student)"
                        class="text-muted hover:text-brand theme-transition">
                  Edit
                </button>
                <button @click="deleteStudent(student)"
                        class="text-muted hover:text-brand theme-transition">
                  Delete
                </button>
              </div>
            </div>
          </li>
        </ul>
        
        <div v-else class="p-8 text-center text-muted">
          {{ loading ? 'Loading students...' : 'No students found.' }}
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-muted">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalStudents }} students
        </div>
        <div class="flex space-x-2">
          <button 
            @click="prevPage"
            :disabled="currentPage === 1"
            class="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            class="btn btn-primary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Add/Edit Student Modal -->
      <div v-if="showAddModal || showEditModal" 
           class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[480px] shadow-lg rounded-lg bg-elevated border-theme">
          <div class="mt-2">
            <h3 class="text-xl font-medium text-base mb-6">
              {{ showAddModal ? 'Add New Student' : 'Edit Student' }}
            </h3>
            <form @submit.prevent="saveStudent" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-muted">Student ID</label>
                <input v-model="studentForm.student_id" type="text" required class="input"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted">First Name</label>
                <input v-model="studentForm.first_name" type="text" required class="input"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted">Last Name</label>
                <input v-model="studentForm.last_name" type="text" required class="input"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted">Email</label>
                <input v-model="studentForm.email" type="email" required class="input"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted">Date of Birth</label>
                <input v-model="studentForm.date_of_birth" type="date" required class="input"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted">Section</label>
                <select v-model="studentForm.section" class="input">
                  <option value="">Select Section</option>
                  <option v-for="section in sections" :key="section.id" :value="section.id">
                    Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
                  </option>
                </select>
              </div>
              <div class="flex justify-end space-x-4 mt-8">
                <button type="button" @click="closeModal" class="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" :disabled="saving" class="btn btn-primary disabled:opacity-50">
                  {{ saving ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { studentsService } from '@/services/api/students.js'
import { formatSection, formatOrdinal } from '@/utils/formatters'

export default {
  name: 'StudentListView',
  data() {
    return {
      sections: [],
      students: [],
      filteredStudents: [],
      loading: false,
      saving: false,
      showAddModal: false,
      showEditModal: false,
      searchTerm: '',
      sortOption: 'name',
      filters: {
        section: '',
        is_active: ''
      },
      studentForm: {
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        section: ''
      },
      editingStudent: null,
      sectionsLoading: false,
      error: null,

      // Pagination state
      currentPage: 1,
      perPage: 10,
      totalStudents: 0,
    }
  },
  
  computed: {
    hasStudents() {
      return this.filteredStudents && this.filteredStudents.length > 0
    },
    
    showEmptyState() {
      return !this.loading && (!this.filteredStudents || this.filteredStudents.length === 0)
    },

    // Pagination computed properties
    paginationStart() {
      return (this.currentPage - 1) * this.perPage + 1
    },

    paginationEnd() {
      return Math.min(this.currentPage * this.perPage, this.totalStudents)
    },

    totalPages() {
      return Math.ceil(this.totalStudents / this.perPage)
    }
  },

  watch: {
    // Add watchers for automatic updates
    sortOption: 'applyFiltersAndSort',
    searchTerm: 'applyFiltersAndSort',
    'filters.section': 'applyFiltersAndSort',

    // Watch filters for changes
    filters: {
      handler() {
        this.currentPage = 1 // Reset to first page when filters change
        this.loadStudents()
      },
      deep: true
    }
  },

  methods: {
    formatSection,  // Make formatSection available to template
    formatOrdinal,  // Make formatOrdinal available to template

    applyFiltersAndSort() {
      // First apply filters
      let result = [...this.students]
      
      // Apply section filter
      if (this.filters.section) {
        result = result.filter(student => 
          student.section?.id === parseInt(this.filters.section)
        )
      }
      
      // Apply search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        result = result.filter(student =>
          student.full_name.toLowerCase().includes(term) ||
          student.student_id.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term)
        )
      }
      
      // Apply sorting
      result.sort((a, b) => {
        switch (this.sortOption) {
          case 'id':
            return a.student_id.localeCompare(b.student_id)
          case 'section':
            const sectionA = a.section ? `${a.section.year_level}-${a.section.name}` : 'Z'
            const sectionB = b.section ? `${b.section.year_level}-${b.section.name}` : 'Z'
            return sectionA.localeCompare(sectionB)
          case 'email':
            return a.email.localeCompare(b.email)
          case 'name':
          default:
            return a.full_name.localeCompare(b.full_name)
        }
      })
      
      this.filteredStudents = result
    },

    async loadSections() {
      this.sectionsLoading = true
      try {
        this.sections = await studentsService.getSections()
      } catch (error) {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          this.$router.push('/login')
        } else {
          console.error('Error loading sections:', error)
        }
      } finally {
        this.sectionsLoading = false
      }
    },
    
    async loadStudents() {
      this.loading = true
      this.error = null // Reset error state
      try {
        console.log('Loading students...') // Debug log
        const params = {
          page: this.currentPage,
          per_page: this.perPage,
          ...this.filters
        }
        const response = await studentsService.getStudentList(params)
        console.log('Loaded students:', response) // Debug log
        this.students = response.results
        this.totalStudents = response.count
        this.applyFiltersAndSort()
      } catch (error) {
        console.error('Failed to load students:', error)
        this.error = 'Failed to load students. Please try again later.' // Set error message
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.$router.push('/login')
        } else {
          alert('Error loading students. Please try again.')
        }
      } finally {
        this.loading = false
      }
    },
    
    searchStudents() {
      this.applyFiltersAndSort() // Replace existing filter logic with new method
    },
    
    viewStudent(student) {
      this.$router.push(`/students/${student.id}`)
    },
    
    editStudent(student) {
      this.editingStudent = student
      this.studentForm = { ...student }
      this.showEditModal = true
    },
    
    async deleteStudent(student) {
      if (confirm(`Are you sure you want to delete ${student.full_name}?`)) {
        try {
          await studentsService.deleteStudent(student.id)
          await this.loadStudents()
        } catch (error) {
          console.error('Error deleting student:', error)
          alert('Failed to delete student')
        }
      }
    },
    
    async saveStudent() {
      this.saving = true
      try {
        if (this.showAddModal) {
          await studentsService.registerStudent(this.studentForm)
        } else {
          await studentsService.updateStudent(this.editingStudent.id, this.studentForm)
        }
        await this.loadStudents()
        this.closeModal()
      } catch (error) {
        console.error('Error saving student:', error)
        alert('Failed to save student')
      } finally {
        this.saving = false
      }
    },
    
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.editingStudent = null
      this.studentForm = {
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        section: ''
      }
    },

    // Pagination methods
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.loadStudents()
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.loadStudents()
      }
    },
  },
  async mounted() {
    await Promise.all([
      this.loadSections(),
      this.loadStudents()
    ])
  }
}
</script>
