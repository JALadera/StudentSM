import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

// Mock the services
vi.mock('@/services/api/students', () => ({
  studentsService: {
    getStudent: vi.fn(),
    getSections: vi.fn().mockResolvedValue([]),
    registerStudent: vi.fn()
  }
}))

vi.mock('@/services/api/subjects', () => ({
  subjectsService: {
    getSubjectList: vi.fn().mockResolvedValue([]),
    enrollStudent: vi.fn(),
    createSubject: vi.fn()
  }
}))

vi.mock('@/services/api/grades', () => ({
  gradesService: {
    getDashboardStats: vi.fn().mockResolvedValue({
      total_students: 0,
      total_subjects: 0,
      total_sections: 0,
      total_enrollments: 0,
      year_level_stats: [],
      subject_stats: []
    })
  }
}))

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: vi.fn()
}))

describe('DashboardView.vue - Simple Tests', () => {
  let wrapper
  
  const createWrapper = () => {
    return mount(DashboardView, {
      global: {
        stubs: {
          'BulkRegisterModal': true,
          'BulkSectionWizard': true,
          'BulkEnrollModal': true,
          'RouterLink': true
        },
        mocks: {
          $loading: {
            show: vi.fn(),
            hide: vi.fn()
          }
        }
      }
    })
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = createWrapper()
  })
  
  it('initializes with default data', () => {
    expect(wrapper.vm.stats).toEqual({
      totalStudents: 0,
      totalSubjects: 0,
      totalSections: 0,
      totalEnrollments: 0
    })
    
    expect(wrapper.vm.sections).toEqual([])
    expect(wrapper.vm.subjects).toEqual([])
    expect(wrapper.vm.error).toBe('')
  })
  
  it('closes modals and resets forms', () => {
    // Test closeAddStudentModal
    wrapper.vm.showAddStudentModal = true
    wrapper.vm.studentForm = { student_id: '123' }
    wrapper.vm.closeAddStudentModal()
    expect(wrapper.vm.showAddStudentModal).toBe(false)
    expect(wrapper.vm.studentForm.student_id).toBe('')
    
    // Test closeSubjectSelectModal
    wrapper.vm.showSubjectSelectModal = true
    wrapper.vm.selectedSubject = '123'
    wrapper.vm.closeSubjectSelectModal()
    expect(wrapper.vm.showSubjectSelectModal).toBe(false)
    expect(wrapper.vm.selectedSubject).toBe('')
    
    // Test closeQuickEnrollModal
    wrapper.vm.showQuickEnrollModal = true
    wrapper.vm.enrollForm = { student_id: '123' }
    wrapper.vm.closeQuickEnrollModal()
    expect(wrapper.vm.showQuickEnrollModal).toBe(false)
    expect(wrapper.vm.enrollForm.student_id).toBe('')
    
    // Test closeAddSubjectModal
    wrapper.vm.showAddSubjectModal = true
    wrapper.vm.subjectForm = { code: 'MATH101' }
    wrapper.vm.closeAddSubjectModal()
    expect(wrapper.vm.showAddSubjectModal).toBe(false)
    expect(wrapper.vm.subjectForm.code).toBe('')
  })
  
  it('navigates to assessments with selected subject', () => {
    wrapper.vm.selectedSubject = '123'
    wrapper.vm.proceedToAssessment()
    expect(mockPush).toHaveBeenCalledWith({
      name: 'Assessments',
      query: {
        subjectId: '123',
        redirectToSubject: 'true'
      }
    })
  })
})
