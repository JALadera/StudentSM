<template>
  <div class="min-h-screen bg-base p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-brand">Student Details</h1>
          <p class="text-muted mt-2">View and manage student information</p>
        </div>
        <div class="flex space-x-4">
          <button
            @click="goBack"
            class="btn btn-secondary"
          >
            Back
          </button>
        </div>
      </div>

      <!-- Student Information -->
      <div v-if="student" class="card p-6 mb-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-muted">Student ID</label>
            <p class="text-xl text-base">{{ student.student_id }}</p>
          </div>
          <div class="space-y-2">
            <label class="text-muted">Full Name</label>
            <p class="text-xl text-base">{{ student.first_name }} {{ student.last_name }}</p>
          </div>
          <div class="space-y-2">
            <label class="text-muted">Email</label>
            <p class="text-xl text-base">{{ student.email }}</p>
          </div>
          <div class="space-y-2">
            <label class="text-muted">Section</label>
            <p class="text-xl text-base">{{ formatSectionDisplay(student.section) }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex justify-end space-x-4">
          <button
            @click="editStudent"
            class="btn btn-secondary"
          >
            Edit Information
          </button>
          <button
            @click="showEnrollModal = true"
            class="btn btn-primary"
          >
            Add Enrollment
          </button>
          <button
            @click="confirmDelete"
            class="btn btn-danger"
          >
            Delete Student
          </button>
        </div>

        <!-- Academic Info -->
        <div class="mt-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold text-brand">Academic Information</h2>
            <button
              @click="changeSection"
              class="btn btn-secondary"
            >
              Change Section
            </button>
          </div>
          <div class="card bg-elevated p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-muted">Section</label>
                <p class="text-lg text-base">
                  {{ formatSectionDisplay(student.section) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Enrolled Subjects -->
        <div class="mt-8">
          <h2 class="text-2xl font-semibold text-brand mb-4">Enrolled Subjects</h2>
          <div class="card">
            <div v-if="enrollments.length === 0" class="p-6 text-center text-muted">
              No subjects enrolled
            </div>
            <div v-else class="divide-y divide-theme">
              <div v-for="enrollment in enrollments" :key="enrollment.id" 
                   class="p-4 flex items-center justify-between">
                <div>
                  <h3 class="text-lg text-base">{{ enrollment.subject_code }} - {{ enrollment.subject_name }}</h3>
                  <p class="text-sm text-muted">Enrolled: {{ formatDate(enrollment.enrollment_date) }}</p>
                </div>
                <button
                  @click="unenrollFromSubject(enrollment.id)"
                  :disabled="loading"
                  class="text-brand hover:text-brand-hover theme-transition disabled:opacity-50"
                >
                  {{ loading ? 'Unenrolling...' : 'Unenroll' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Grades Table -->
        <div class="mt-8">
          <h2 class="text-2xl font-semibold text-brand mb-4">Final Grades</h2>
          <div class="card">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-elevated">
                  <tr>
                    <th class="p-4 text-muted">Subject Code</th>
                    <th class="p-4 text-muted">Subject Name</th>
                    <th class="p-4 text-muted">Final Grade</th>
                    <th class="p-4 text-muted">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-theme">
                  <tr v-for="grade in student.grades" 
                      :key="grade.subject_code">
                    <td class="p-4 text-base">{{ grade.subject_code }}</td>
                    <td class="p-4 text-base">{{ grade.subject_name }}</td>
                    <td class="p-4 text-base">{{ grade.final_grade }}%</td>
                    <td class="p-4">
                      <span :class="getGradeStatusClass(grade.final_grade)"
                            class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ grade.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!student.grades?.length">
                    <td colspan="4" class="p-4 text-center text-muted">
                      No grades available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex justify-center items-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-brand"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg">
        {{ error }}
      </div>

      <!-- Modals -->
      <ChangeSectionModal
        v-if="showChangeSectionModal"
        :show="showChangeSectionModal"
        :sections="sections"
        :current-section-id="student?.section?.id"
        @close="showChangeSectionModal = false"
        @update="updateSection"
      />

      <EnrollmentModal
        v-if="student"
        :show="showEnrollModal"
        :student-id="student.id"
        :year-level="student.section?.year_level || 1"
        @close="showEnrollModal = false"
        @enrolled="loadEnrollments"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studentsService } from '@/services/api/students'
import { subjectsService } from '@/services/api/subjects'
import { gradesService } from '@/services/api/grades'
import EnrollmentModal from '@/components/enrollment/EnrollmentModal.vue'
import ChangeSectionModal from '@/components/students/ChangeSectionModal.vue'

const route = useRoute()
const router = useRouter()
const student = ref(null)
const enrollments = ref([])
const loading = ref(true)
const error = ref(null)
const sections = ref([])
const showEnrollModal = ref(false)
const showChangeSectionModal = ref(false)

const loadStudent = async () => {
  if (!route.params.id) {
    error.value = 'Student ID is required'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    console.log('Loading student with ID:', route.params.id) // Debug log
    const response = await studentsService.getStudentDetail(route.params.id)
    console.log('Student data received:', response) // Debug log
    student.value = response
  } catch (err) {
    console.error('Error loading student:', err)
    error.value = err.response?.data?.error || 'Failed to load student details'
  } finally {
    loading.value = false
  }
}

const loadEnrollments = async () => {
  if (!student.value?.id) return
  
  loading.value = true
  error.value = null
  
  try {
    // Load enrollments first
    const enrollmentsResponse = await subjectsService.getStudentEnrollments(student.value.id)
      .catch(err => {
        console.error('Error loading enrollments:', err);
        return [];
      });
    
    // Update enrollments immediately
    enrollments.value = enrollmentsResponse;

    // Try to load grades if the service exists
    if (gradesService?.getStudentGrades) {
      const gradesResponse = await gradesService.getStudentGrades(student.value.id)
        .catch(err => {
          console.error('Error loading grades:', err);
          return [];
        });

      if (student.value) {
        student.value = {
          ...student.value,
          grades: gradesResponse || []
        };
      }
    }
  } catch (error) {
    console.error('Error loading data:', error);
    error.value = 'Failed to load student data';
  } finally {
    loading.value = false;
  }
}

const loadSections = async () => {
  try {
    sections.value = await studentsService.getSections()
  } catch (error) {
    console.error('Error loading sections:', error)
  }
}

// Make sure the unenroll function reloads data properly
const unenrollFromSubject = async (enrollmentId) => {
  if (!confirm('Are you sure you want to unenroll from this subject?')) return
  
  try {
    loading.value = true
    await subjectsService.unenrollStudent(enrollmentId)
    await loadEnrollments() // Reload both enrollments and grades
  } catch (error) {
    console.error('Error unenrolling:', error)
    alert(error.response?.data?.error || 'Failed to unenroll from subject')
  } finally {
    loading.value = false
  }
}

const editStudent = () => {
  router.push(`/students/${route.params.id}/edit`)
}

const changeSection = () => {
  showChangeSectionModal.value = true
}

const updateSection = async (newSectionId) => {
  loading.value = true
  try {
    await studentsService.assignToSection(student.value.id, newSectionId)
    await loadStudent()
  } catch (error) {
    console.error('Error changing section:', error)
    alert(error.response?.data?.error || 'Failed to change section')
  } finally {
    loading.value = false
  }
}

const confirmDelete = async () => {
  if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
    return
  }

  try {
    await studentsService.deleteStudent(route.params.id)
    router.push('/students')
  } catch (error) {
    console.error('Error deleting student:', error)
    alert('Failed to delete student')
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  console.log('Component mounted, route params:', route.params) // Debug log
  await Promise.all([
    loadStudent(),
    loadSections()
  ])
  if (student.value?.id) {
    await loadEnrollments()
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Grade status helpers
const getGradeStatus = (score) => {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Good'
  if (score >= 75) return 'Passing'
  return 'Failed'
}

const getGradeStatusClass = (score) => {
  if (score >= 90) return 'bg-green-900/30 text-green-400';
  if (score >= 80) return 'bg-blue-900/30 text-blue-400';
  if (score >= 75) return 'bg-yellow-900/30 text-yellow-400';
  return 'bg-red-900/30 text-red-400';
}

const formatOrdinal = (num) => {
  const n = parseInt(num);
  return n + (['st','nd','rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th');
};

const formatSectionDisplay = (section) => {
  if (!section) return 'Not Assigned'
  return `Year ${section.year_level} - ${formatOrdinal(parseInt(section.name))} Section`
}
</script>