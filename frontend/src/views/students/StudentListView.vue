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
      <div v-if="totalPages > 1" class="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div class="text-sm text-muted">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalStudents }} {{ totalStudents === 1 ? 'student' : 'students' }}
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="text-sm text-muted mr-4">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          
          <div class="flex space-x-1">
            <button 
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              &laquo;
            </button>
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              &lsaquo;
            </button>
            
            <!-- Page numbers -->
            <template v-for="page in visiblePages" :key="page">
              <button 
                v-if="page === '...'"
                class="px-3 py-1 rounded-md border border-transparent"
                disabled
              >
                {{ page }}
              </button>
              <button 
                v-else
                @click="goToPage(page)"
                class="px-3 py-1 rounded-md border"
                :class="{
                  'border-brand-500 bg-brand-50 text-brand-700 font-medium': currentPage === page,
                  'border-gray-300 bg-white text-gray-700 hover:bg-gray-50': currentPage !== page
                }"
              >
                {{ page }}
              </button>
            </template>
            
            <button 
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
            >
              &rsaquo;
            </button>
            <button 
              @click="goToPage(totalPages)"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
            >
              &raquo;
            </button>
          </div>
          
          <!-- Items per page selector -->
          <div class="flex items-center ml-4">
            <span class="text-sm text-muted mr-2">Per page:</span>
            <select 
              v-model="perPage"
              @change="handlePerPageChange"
              class="text-sm border-gray-300 rounded-md focus:border-brand-500 focus:ring-brand-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
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
      searchTimeout: null, // For debouncing search
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
    },
    
    // Generate array of visible page numbers with ellipsis
    visiblePages() {
      const range = [];
      const total = this.totalPages;
      const current = this.currentPage;
      const delta = 2; // Number of pages to show on each side of current page
      
      // Always show first page
      range.push(1);
      
      // Calculate range around current page
      const start = Math.max(2, current - delta);
      const end = Math.min(total - 1, current + delta);
      
      // Add ellipsis if needed after first page
      if (start > 2) {
        range.push('...');
      }
      
      // Add page numbers around current page
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      
      // Add ellipsis if needed before last page
      if (end < total - 1) {
        range.push('...');
      }
      
      // Always show last page if not already included
      if (total > 1 && !range.includes(total)) {
        range.push(total);
      }
      
      return range;
    }
  },



  methods: {
    formatSection,  // Make formatSection available to template
    formatOrdinal,  // Make formatOrdinal available to template

    // Update to handle server-side filtering and sorting
    buildQueryParams() {
      const params = {
        page: this.currentPage,
        page_size: this.perPage,
        ...this.filters
      }
      
      // Add search term if it exists
      if (this.searchTerm) {
        params.search = this.searchTerm
      }
      
      // Add ordering
      if (this.sortOption) {
        let orderBy = this.sortOption
        if (this.sortOption === 'name') {
          orderBy = 'last_name,first_name'  // Default name sorting
        }
        params.ordering = orderBy
      }
      
      return params
    },
    
    // Simple client-side filtering for any remaining UI needs
    applyClientSideFilters(students) {
      return students // No client-side filtering needed as it's handled server-side
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
        // Build query params including pagination
        const params = {
          ...this.buildQueryParams(),
          page: this.currentPage,
          perPage: this.perPage
        }
        
        console.log('Loading students with params:', params); // Debug log
        
        const response = await studentsService.getStudentList(params)
        
        // Update the students list and pagination info
        this.students = response.results || []
        this.filteredStudents = [...this.students] // Keep a copy for client-side filtering if needed
        this.totalStudents = response.count || 0
        
        // Update pagination info from response
        this.currentPage = response.page || 1
        this.perPage = response.page_size || this.perPage
        
        // Update the URL with current state
        this.updateURL()
        
      } catch (error) {
        console.error('Failed to load students:', error)
        this.error = 'Failed to load students. Please try again later.'
        if (error.response?.status === 401) {
          this.$router.push('/login')
        }
      } finally {
        this.loading = false
      }
    },
    
    // Update URL with current pagination and filters
    updateURL() {
      const query = {}
      if (this.currentPage > 1) query.page = this.currentPage
      if (this.perPage !== 10) query.perPage = this.perPage
      if (this.filters.section) query.section = this.filters.section
      if (this.searchTerm) query.search = this.searchTerm
      if (this.sortOption !== 'name') query.sort = this.sortOption
      
      // Only update URL if it's different from current
      const currentQuery = { ...this.$route.query }
      if (JSON.stringify(currentQuery) !== JSON.stringify(query)) {
        this.$router.replace({ query }).catch(() => {})
      }
    },
    
    searchStudents() {
      // Debounce the search to avoid too many API calls
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.loadStudents()
      }, 300)
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
          // For new students, just register them with the section
          await studentsService.registerStudent(this.studentForm)
        } else {
          // For existing students, handle section update separately
          const studentData = { ...this.studentForm }
          const { section, ...basicInfo } = studentData
          
          // Update basic info if there are any changes
          if (Object.keys(basicInfo).length > 0) {
            await studentsService.updateStudent(this.editingStudent.id, basicInfo)
          }
          
          // Update section if it was changed
          if (section !== undefined && section !== null && section !== '') {
            await studentsService.assignToSection(this.editingStudent.id, section)
          }
        }
        
        await this.loadStudents()
        this.closeModal()
      } catch (error) {
        console.error('Error saving student:', error)
        alert(error.response?.data?.error || 'Failed to save student')
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
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.loadStudents();
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadStudents();
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadStudents();
      }
    },
    
    handlePerPageChange() {
      // Reset to first page when changing items per page
      this.currentPage = 1;
      this.loadStudents();
    },
  },
  async mounted() {
    // Initialize from URL query parameters if they exist
    const { query } = this.$route
    
    // Set initial state from URL query
    if (query.page) this.currentPage = parseInt(query.page) || 1
    if (query.perPage) this.perPage = parseInt(query.perPage) || 10
    if (query.section) this.filters.section = query.section
    if (query.search) this.searchTerm = query.search
    if (query.sort) this.sortOption = query.sort
    
    // Load initial data
    await Promise.all([
      this.loadSections(),
      this.loadStudents()
    ])
  },
  
  // Watch for route changes to handle back/forward navigation
  watch: {
    '$route.query': {
      handler(query) {
        // Only reload if the query actually changed
        if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
          this.loadStudents()
        }
      },
      deep: true,
      immediate: true
    },
    // Keep existing watchers
    sortOption() {
      this.currentPage = 1
      this.loadStudents()
    },
    
    searchTerm() {
      this.currentPage = 1
      this.loadStudents()
    },
    
    // Watch filters for changes
    filters: {
      handler() {
        this.currentPage = 1 // Reset to first page when filters change
        this.loadStudents()
      },
      deep: true
    }
  }
}
</script>
