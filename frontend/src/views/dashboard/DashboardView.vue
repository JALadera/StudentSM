<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card p-6">
          <h3 class="text-muted text-sm">Total Students</h3>
          <p class="text-2xl font-bold text-base mt-2">{{ stats.totalStudents }}</p>
        </div>
        <div class="card p-6">
          <h3 class="text-muted text-sm">Total Subjects</h3>
          <p class="text-2xl font-bold text-base mt-2">{{ stats.totalSubjects }}</p>
        </div>
        <div class="card p-6">
          <h3 class="text-muted text-sm">Active Sections</h3>
          <p class="text-2xl font-bold text-base mt-2">{{ stats.totalSections }}</p>
        </div>
        <div class="card p-6">
          <h3 class="text-muted text-sm">Total Enrollments</h3>
          <p class="text-2xl font-bold text-base mt-2">{{ stats.totalEnrollments }}</p>
        </div>
      </div>

      <!-- Management Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Left Column: Management Actions -->
        <div class="space-y-6">
          <!-- Student Management Card -->
          <div class="card p-6">
            <h2 class="text-xl font-semibold text-red-600 mb-4">Student Management</h2>
            <div class="space-y-4">
              <!-- Bulk Register -->
              <div class="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <h3 class="font-medium text-base">Bulk Register Students</h3>
                  <p class="text-muted">Register multiple students at once</p>
                </div>
                <button 
                  @click="showBulkRegisterModal = true"
                  class="btn btn-primary"
                >
                  Register
                </button>
              </div>

              <!-- Section Assignment -->
              <div class="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <h3 class="font-medium text-base">Bulk Section Assignment</h3>
                  <p class="text-muted">Assign multiple students to sections</p>
                </div>
                <button 
                  @click="showBulkSectionModal = true"
                  class="btn btn-primary"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>

          <!-- Subject Management Card -->
          <div class="card p-6">
            <h2 class="text-xl font-semibold text-red-600 mb-4">Subject Management</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <h3 class="font-medium text-base">Bulk Subject Enrollment</h3>
                  <p class="text-muted">Enroll multiple students in subjects</p>
                </div>
                <button 
                  @click="showBulkEnrollModal = true"
                  class="btn btn-primary"
                >
                  Enroll
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Recent Activity & Quick Stats -->
        <div class="space-y-6">
          <!-- Recent Activity Card -->
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
                    <p class="text-lg text-base">{{ year.averagePerSection }}</p>
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
                    <p class="text-lg text-base">{{ year.totalUnits }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-red-600 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Add Student -->
          <div @click="showAddStudentModal = true" 
               class="card p-6 cursor-pointer hover:bg-elevated theme-transition">
            <h3 class="text-lg font-medium text-base">Add New Student</h3>
            <p class="text-muted mt-1">Register a new student</p>
          </div>

          <!-- Add Subject -->
          <div @click="showAddSubjectModal = true"
               class="card p-6 cursor-pointer hover:bg-elevated theme-transition">
            <h3 class="text-lg font-medium text-base">Add New Subject</h3>
            <p class="text-muted mt-1">Create a new course subject</p>
          </div>

          <!-- Quick Enroll -->
          <div @click="showQuickEnrollModal = true"
               class="card p-6 cursor-pointer hover:bg-elevated theme-transition">
            <h3 class="text-lg font-medium text-base">Quick Enroll</h3>
            <p class="text-muted mt-1">Enroll a student in a subject</p>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <BulkRegisterModal 
        v-if="showBulkRegisterModal" 
        @close="showBulkRegisterModal = false"
        @success="loadStats"
      />
      <BulkSectionModal 
        v-if="showBulkSectionModal" 
        @close="showBulkSectionModal = false"
        @success="loadStats"
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
    </div>

    <!-- Modals -->
    <BulkRegisterModal 
      v-if="showBulkRegisterModal" 
      @close="showBulkRegisterModal = false"
      @success="loadStats"
    />
    <BulkSectionModal 
      v-if="showBulkSectionModal" 
      @close="showBulkSectionModal = false"
      @success="loadStats"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gradesService } from '@/services/api/grades'
import { studentsService } from '@/services/api/students'
import { subjectsService } from '@/services/api/subjects'
import BulkRegisterModal from '@/components/students/BulkRegisterModal.vue'
import BulkSectionModal from '@/components/students/BulkSectionModal.vue'
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
    stats.value = {
      totalStudents: dashboardStats.total_students,
      totalSubjects: dashboardStats.total_subjects,
      totalSections: dashboardStats.total_sections,
      totalEnrollments: dashboardStats.total_enrollments
    }
    yearLevelStats.value = dashboardStats.year_level_stats
    subjectStats.value = dashboardStats.subject_stats
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
  }
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
    router.push(`/subjects/${selectedSubject.value}/assessments/new`)
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

        await subjectsService.enrollStudent(
            enrollForm.value.subject_id, 
            enrollForm.value.student_id
        )
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
