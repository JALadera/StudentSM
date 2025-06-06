<template>
  <div class="min-h-screen bg-base p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p class="text-muted">Welcome back! Here's what's happening with your school.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Students Card -->
        <div class="card p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-lg bg-opacity-20 bg-red-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-muted text-sm">Total Students</h3>
              <p class="text-2xl font-bold mt-1">{{ stats.totalStudents || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Subjects Card -->
        <div class="card p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-lg bg-opacity-20 bg-blue-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 class="text-muted text-sm">Total Subjects</h3>
              <p class="text-2xl font-bold mt-1">{{ stats.totalSubjects || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Sections Card -->
        <div class="card p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-lg bg-opacity-20 bg-green-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 class="text-muted text-sm">Active Sections</h3>
              <p class="text-2xl font-bold mt-1">{{ stats.totalSections || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Enrollments Card -->
        <div class="card p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-lg bg-opacity-20 bg-purple-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 class="text-muted text-sm">Total Enrollments</h3>
              <p class="text-2xl font-bold mt-1">{{ stats.totalEnrollments || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Section -->
      <div class="space-y-6 mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 class="text-2xl font-semibold">Bulk Actions</h2>
            <p class="text-muted text-sm">Perform multiple operations at once</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Bulk Register Card -->
          <div class="card p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div class="flex items-start space-x-4">
              <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-lg mb-2">Bulk Register</h3>
                <p class="text-sm text-muted mb-4">Register multiple students at once using a CSV file</p>
                <button 
                  @click="showBulkRegisterModal = true"
                  class="btn btn-primary w-full flex items-center justify-center py-2 px-4 rounded-md"
                  :disabled="loading"
                >
                  <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                  <span v-else class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Start Registration
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Bulk Section Assignment Card -->
          <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div class="flex items-start space-x-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-lg mb-1">Section Assignment</h3>
                <p class="text-sm text-muted mb-4">Assign multiple students to sections in bulk</p>
                <button 
                  @click="showBulkSectionModal = true"
                  class="btn btn-primary w-full"
                  :disabled="loading"
                >
                  Manage Sections
                </button>
              </div>
            </div>
          </div>

          <!-- Bulk Enrollment Card -->
          <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div class="flex items-start space-x-4">
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-lg mb-1">Bulk Enrollment</h3>
                <p class="text-sm text-muted mb-4">Enroll multiple students in subjects</p>
                <button 
                  @click="showBulkEnrollModal = true"
                  class="btn btn-primary w-full"
                  :disabled="loading"
                >
                  Manage Enrollments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>

        <!-- Section Overview and Subject Distribution Side by Side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Section Overview Card -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-red-600 mb-4">Section Overview</h2>
          <div class="space-y-4">
            <div v-for="year in yearLevelStats" :key="year.level" 
                 class="p-4 bg-base rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium text-base">Year {{ year.level }}</h3>
                  <p class="text-sm text-muted">{{ year.totalStudents }} Students in {{ year.sectionCount }} Sections</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-muted">Avg Students/Section</p>
                  <p class="text-lg">{{ year.averagePerSection }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subject Distribution Card -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-red-600 mb-4">Subject Distribution</h2>
          <div class="space-y-4">
            <div v-for="year in subjectStats" :key="year.level" 
                 class="p-4 bg-base rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium text-base">Year {{ year.level }}</h3>
                  <p class="text-sm text-muted">{{ year.totalSubjects }} Subjects</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-muted">Total Units</p>
                  <p class="text-lg">{{ year.totalUnits }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Quick Actions</h2>
        <p class="text-muted text-sm mb-6">Frequently used actions</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Add Student -->
          <div 
            @click="showAddStudentModal = true"
            class="card p-6 text-center cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          >
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 class="font-medium text-lg">Add Student</h3>
            <p class="text-sm text-muted mt-1">Register a new student</p>
            <div class="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Click to add
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Create Assessment -->
          <div 
            @click="showSubjectSelectModal = true"
            class="card p-6 text-center cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          >
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="font-medium text-lg">Create Assessment</h3>
            <p class="text-sm text-muted mt-1">Add quiz, exam, or activity</p>
            <div class="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Click to create
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Quick Enroll -->
          <div 
            @click="showQuickEnrollModal = true"
            class="card p-6 text-center cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          >
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="font-medium text-lg">Quick Enroll</h3>
            <p class="text-sm text-muted mt-1">Enroll student in a subject</p>
            <div class="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Click to enroll
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Add Subject -->
          <div 
            @click="showAddSubjectModal = true"
            class="card p-6 text-center cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          >
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="font-medium text-lg">Add Subject</h3>
            <p class="text-sm text-muted mt-1">Create a new subject</p>
            <div class="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- End of Main Content -->

    <!-- Modals -->
    <BulkRegisterModal 
      v-if="showBulkRegisterModal" 
      @close="showBulkRegisterModal = false"
      @success="loadStats"
    />
    <BulkSectionWizard 
      v-if="showBulkSectionModal" 
      @close="showBulkSectionModal = false"
      @success="handleModalSuccess"
    />
    <BulkEnrollModal 
      v-if="showBulkEnrollModal" 
      @close="showBulkEnrollModal = false"
      @success="loadStats"
    />

      <!-- Quick Add Student Modal -->
      <div v-if="showAddStudentModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[600px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
          <h3 class="text-xl font-medium text-gray-200 mb-6">Add New Student</h3>
          
          <form @submit.prevent="handleAddStudent" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400">Student ID *</label>
                <input 
                  v-model="studentForm.student_id" 
                  type="text" 
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400">Section *</label>
                <select 
                  v-model="studentForm.section" 
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                >
                  <option value="">Select Section</option>
                  <option v-for="section in sections" :key="section.id" :value="section.id">
                    Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400">First Name *</label>
                <input 
                  v-model="studentForm.first_name" 
                  type="text" 
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400">Last Name *</label>
                <input 
                  v-model="studentForm.last_name" 
                  type="text" 
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400">Email *</label>
                <input 
                  v-model="studentForm.email" 
                  type="email" 
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400">Date of Birth *</label>
                <input 
                  v-model="studentForm.date_of_birth" 
                  type="date" 
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                />
              </div>
            </div>

            <!-- Error Display -->
            <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg">
              {{ error }}
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeAddStudentModal"
                class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {{ loading ? 'Processing...' : 'Add Student' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Subject Selection Modal for Assessment -->
      <div v-if="showSubjectSelectModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[500px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
          <h3 class="text-xl font-medium text-gray-200 mb-6">Select Subject for Assessment</h3>
          <div class="space-y-4">
            <select v-model="selectedSubject" required
                    class="block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200">
              <option value="">Select a Subject</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.code }} - {{ subject.name }}
              </option>
            </select>
            <div class="flex justify-end space-x-4">
              <button @click="closeSubjectSelectModal"
                      class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]">
                Cancel
              </button>
              <button @click="proceedToAssessment" :disabled="!selectedSubject"
                      class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Enroll Modal -->
      <div v-if="showQuickEnrollModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[500px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
          <h3 class="text-xl font-medium text-gray-200 mb-6">Quick Enroll Student</h3>
          <form @submit.prevent="handleQuickEnroll" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400">Student ID</label>
              <input v-model="enrollForm.student_id" type="text" required
                     class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                     placeholder="Enter Student ID"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">Subject</label>
              <select v-model="enrollForm.subject_id" required
                      class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200">
                <option value="">Select Subject</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.code }} - {{ subject.name }}
                </option>
              </select>
            </div>
            <div class="flex justify-end space-x-4">
              <button type="button" @click="closeQuickEnrollModal"
                      class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                Enroll
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Quick Add Subject Modal -->
      <div v-if="showAddSubjectModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-6 border w-[600px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
          <h3 class="text-xl font-medium text-gray-200 mb-6">Add New Subject</h3>
          
          <form @submit.prevent="handleAddSubject" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400">Subject Code *</label>
                <input 
                  v-model="subjectForm.code"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400">Units *</label>
                <input 
                  v-model="subjectForm.units"
                  type="number"
                  required
                  min="1"
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-400">Subject Name *</label>
                <input 
                  v-model="subjectForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-400">Description</label>
                <textarea 
                  v-model="subjectForm.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400">Year Level *</label>
                <select 
                  v-model="subjectForm.year_level"
                  required
                  class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                >
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div>
            </div>

            <!-- Error Display -->
            <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg">
              {{ error }}
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeAddSubjectModal"
                class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {{ loading ? 'Processing...' : 'Add Subject' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    <!-- Modals -->
    <div v-if="showBulkRegisterModal" class="fixed inset-0 bg-black bg-opacity-75 z-50" @click.self="showBulkRegisterModal = false">
      <BulkRegisterModal 
        @close="() => showBulkRegisterModal = false"
        @success="handleModalSuccess"
      />
    </div>
    
    <div v-if="showBulkSectionModal" class="fixed inset-0 bg-black bg-opacity-75 z-50" @click.self="showBulkSectionModal = false">
      <BulkSectionWizard 
        @close="() => showBulkSectionModal = false"
        @success="handleModalSuccess"
      />
    </div>
    
    <div v-if="showBulkEnrollModal" class="fixed inset-0 bg-black bg-opacity-75 z-50" @click.self="showBulkEnrollModal = false">
      <BulkEnrollModal 
        @close="() => showBulkEnrollModal = false"
        @success="handleModalSuccess"
      />
    </div>

    <!-- Quick Add Student Modal -->
    <div v-if="showAddStudentModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-6 border w-[600px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
        <h3 class="text-xl font-medium text-gray-200 mb-6">Add New Student</h3>
        
        <form @submit.prevent="handleAddStudent" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400">Student ID *</label>
              <input 
                v-model="studentForm.student_id" 
                type="text" 
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">Section *</label>
              <select 
                v-model="studentForm.section" 
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              >
                <option value="">Select Section</option>
                <option v-for="section in sections" :key="section.id" :value="section.id">
                  Year {{ section.year_level }} - {{ formatOrdinal(section.name) }} Section
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">First Name *</label>
              <input 
                v-model="studentForm.first_name" 
                type="text" 
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">Last Name *</label>
              <input 
                v-model="studentForm.last_name" 
                type="text" 
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">Email *</label>
              <input 
                v-model="studentForm.email" 
                type="email" 
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">Date of Birth *</label>
              <input 
                v-model="studentForm.date_of_birth" 
                type="date" 
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              />
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg">
            {{ error }}
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeAddStudentModal"
              class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{ loading ? 'Processing...' : 'Add Student' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subject Selection Modal for Assessment -->
    <div v-if="showSubjectSelectModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-6 border w-[500px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
        <h3 class="text-xl font-medium text-gray-200 mb-6">Select Subject for Assessment</h3>
        <div class="space-y-4">
          <select v-model="selectedSubject" required
                  class="block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200">
            <option value="">Select a Subject</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.code }} - {{ subject.name }}
            </option>
          </select>
          <div class="flex justify-end space-x-4">
            <button @click="closeSubjectSelectModal"
                    class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]">
              Cancel
            </button>
            <button @click="proceedToAssessment" :disabled="!selectedSubject"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Enroll Modal -->
    <div v-if="showQuickEnrollModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-6 border w-[500px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
        <h3 class="text-xl font-medium text-gray-200 mb-6">Quick Enroll Student</h3>
        <form @submit.prevent="handleQuickEnroll" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400">Student ID</label>
            <input v-model="enrollForm.student_id" type="text" required
                   class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
                   placeholder="Enter Student ID"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400">Subject</label>
            <select v-model="enrollForm.subject_id" required
                    class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200">
              <option value="">Select Subject</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.code }} - {{ subject.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end space-x-4">
            <button type="button" @click="closeQuickEnrollModal"
                    class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]">
              Cancel
            </button>
            <button type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
              Enroll
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Quick Add Subject Modal -->
    <div v-if="showAddSubjectModal" class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-6 border w-[600px] shadow-lg rounded-lg bg-[#1a1a1a] border-gray-800">
        <h3 class="text-xl font-medium text-gray-200 mb-6">Add New Subject</h3>
        
        <form @submit.prevent="handleAddSubject" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400">Subject Code *</label>
              <input 
                v-model="subjectForm.code"
                type="text"
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">Units *</label>
              <input 
                v-model="subjectForm.units"
                type="number"
                required
                min="1"
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-400">Subject Name *</label>
              <input 
                v-model="subjectForm.name"
                type="text"
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-400">Description</label>
              <textarea 
                v-model="subjectForm.description"
                rows="3"
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400">Year Level *</label>
              <select 
                v-model="subjectForm.year_level"
                required
                class="mt-1 block w-full rounded-md bg-[#141414] border-gray-800 text-gray-200"
              >
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg">
            {{ error }}
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="closeAddSubjectModal"
              class="px-4 py-2 text-sm font-medium text-gray-400 bg-[#141414] rounded-md hover:bg-[#1f1f1f]"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{ loading ? 'Processing...' : 'Add Subject' }}
            </button>
          </div>
        </form>
      </div>
    </div>
 

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gradesService } from '@/services/api/grades'
import { studentsService } from '@/services/api/students'
import { subjectsService } from '@/services/api/subjects'
import BulkRegisterModal from '@/components/students/BulkRegisterModal.vue'
import BulkSectionWizard from '@/components/students/BulkSectionWizard.vue'
import BulkEnrollModal from '@/components/subjects/BulkEnrollModal.vue'
import { formatOrdinal } from '@/utils/formatters'

const router = useRouter()
// Add error ref
const error = ref('')
const sections = ref([])
const subjects = ref([])

const stats = ref({
  totalStudents: 0,
  totalSubjects: 0,
  totalSections: 0,
  totalEnrollments: 0
})

const yearLevelStats = ref([])
const subjectStats = ref([])

const showBulkRegisterModal = ref(false)
const showBulkSectionModal = ref(false)
const showBulkEnrollModal = ref(false)

const showAddStudentModal = ref(false)
const showSubjectSelectModal = ref(false)
const showQuickEnrollModal = ref(false)
const showAddSubjectModal = ref(false)

const selectedSubject = ref('')
const studentForm = ref({
  student_id: '',
  first_name: '',
  last_name: '',
  email: '',
  section: '',
  date_of_birth: ''
})
const enrollForm = ref({
  student_id: '',
  subject_id: ''
})
const subjectForm = ref({
  code: '',
  name: '',
  description: '',
  units: 3,
  year_level: 1,
  prerequisites: []
})

// Load stats for dashboard
const loadStats = async () => {
  try {
    const dashboardStats = await gradesService.getDashboardStats()
    console.log('Loaded stats:', dashboardStats) // Debug log
    
    stats.value = {
      totalStudents: dashboardStats.total_students || 0,
      totalSubjects: dashboardStats.total_subjects || 0,
      totalSections: dashboardStats.total_sections || 0,
      totalEnrollments: dashboardStats.total_enrollments || 0
    }
    
    yearLevelStats.value = dashboardStats.year_level_stats || []
    subjectStats.value = dashboardStats.subject_stats || []
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
    // Show error to user
    error.value = 'Failed to load dashboard statistics'
  }
}

const handleModalSuccess = () => {
  loadStats()
}

// Load sections for student registration
const loadSections = async () => {
  try {
    sections.value = await studentsService.getSections()
  } catch (error) {
    console.error('Error loading sections:', error)
  }
}

// Load subjects for enrollment and assessment
const loadSubjects = async () => {
  try {
    subjects.value = await subjectsService.getSubjectList()
  } catch (error) {
    console.error('Error loading subjects:', error)
  }
}

// Handle student registration
const handleAddStudent = async () => {
  error.value = ''
  
  try {
    const formData = {
      ...studentForm.value,
      section: parseInt(studentForm.value.section)
    }
    
    await studentsService.registerStudent(formData)
    await loadStats()
    closeAddStudentModal()
  } catch (err) {
    console.error('Error adding student:', err)
    error.value = err.response?.data?.error || 'Failed to add student'
  }
}

// Proceed to assessment creation
const proceedToAssessment = () => {
  if (selectedSubject.value) {
    // Navigate to the assessments page with the selected subject and redirect flag
    router.push({
      name: 'Assessments',
      query: { 
        subjectId: selectedSubject.value,
        redirectToSubject: 'true'  // Add this flag
      }
    })
    closeSubjectSelectModal()
  }
}

// Handle quick enrollment of student
const handleQuickEnroll = async () => {
    error.value = ''
    
    try {
        if (!enrollForm.value.student_id || !enrollForm.value.subject_id) {
            error.value = 'Both student ID and subject are required'
            return
        }

        // Trim any whitespace from student ID
        const studentId = enrollForm.value.student_id.toString().trim()
        await subjectsService.enrollStudent({
            subject_id: enrollForm.value.subject_id, 
            student_id: studentId
        })
        await loadStats() // Refresh dashboard stats
        closeQuickEnrollModal()
        alert('Student enrolled successfully')
    } catch (err) {
        console.error('Error enrolling student:', err)
        error.value = err.response?.data?.error || 'Failed to enroll student'
    }
}

// Handle subject registration
const handleAddSubject = async () => {
  error.value = ''
  
  try {
    const formData = {
      ...subjectForm.value,
      units: parseInt(subjectForm.value.units),
      year_level: parseInt(subjectForm.value.year_level)
    }
    
    await subjectsService.createSubject(formData)
    await loadStats()
    closeAddSubjectModal()
  } catch (err) {
    console.error('Error adding subject:', err)
    error.value = err.response?.data?.error || 'Failed to add subject'
  }
}

// Close modals and reset forms
const closeAddStudentModal = () => {
  showAddStudentModal.value = false
  error.value = ''
  studentForm.value = {
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    section: '',
    date_of_birth: ''
  }
}

const closeSubjectSelectModal = () => {
  showSubjectSelectModal.value = false
  selectedSubject.value = ''
}

const closeQuickEnrollModal = () => {
  showQuickEnrollModal.value = false
  enrollForm.value = {
    student_id: '',
    subject_id: ''
  }
}

const closeAddSubjectModal = () => {
  showAddSubjectModal.value = false
  error.value = ''
  subjectForm.value = {
    code: '',
    name: '',
    description: '',
    units: 3,
    year_level: 1,
    prerequisites: []
  }
}

// Fetch initial data
onMounted(async () => {
  try {
    await Promise.all([
      loadStats(),
      loadSections(),
      loadSubjects()
    ])
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
})
</script>
