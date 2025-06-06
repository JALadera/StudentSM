import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useRouter, useRoute } from 'vue-router'

// Import the mocks
import { studentsService } from '@/services/api/students'
import { subjectsService } from '@/services/api/subjects'
import { gradesService } from '@/services/api/grades'

// Mock the services
vi.mock('@/services/api/students', () => ({
  __esModule: true,
  default: studentsService,
  studentsService: studentsService
}))

vi.mock('@/services/api/subjects', () => ({
  __esModule: true,
  default: subjectsService,
  subjectsService: subjectsService
}))

vi.mock('@/services/api/grades', () => ({
  __esModule: true,
  default: gradesService,
  gradesService: gradesService
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  useRoute: vi.fn()
}))

describe('DashboardView.vue', () => {
  let wrapper
  let mockRouter
  let mockRoute
  
  const createWrapper = (initialRoute = '/') => {
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      currentRoute: {
        value: {
          path: initialRoute,
          name: 'Dashboard',
          params: {},
          query: {}
        }
      }
    }
    
    mockRoute = {
      path: initialRoute,
      name: 'Dashboard',
      params: {},
      query: {}
    }
    
    useRouter.mockReturnValue(mockRouter)
    useRoute.mockReturnValue(mockRoute)
    
    return mount(DashboardView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            fakeApp: true
          })
        ],
        stubs: {
          'BulkRegisterModal': true,
          'BulkSectionWizard': true,
          'BulkEnrollModal': true,
          'RouterLink': true
        },
        mocks: {
          $route: mockRoute,
          $router: mockRouter
        }
      }
    })
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = createWrapper()
  })
  
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })
  
  describe('Initialization', () => {
    it('loads initial data on mount', async () => {
      // Mock the API responses
      const mockStats = {
        total_students: 100,
        total_subjects: 20,
        total_sections: 5,
        total_enrollments: 500,
        year_level_stats: [],
        subject_stats: []
      }
      
      gradesService.getDashboardStats.mockResolvedValueOnce(mockStats)
      studentsService.getSections.mockResolvedValueOnce([
        { id: 1, name: 'Section A', year_level: 1 },
        { id: 2, name: 'Section B', year_level: 2 }
      ])
      
      subjectsService.getSubjectList.mockResolvedValueOnce([
        { id: 1, code: 'MATH101', name: 'Mathematics' },
        { id: 2, code: 'ENG101', name: 'English' }
      ])
      
      // Re-mount with the new mocks
      wrapper.unmount()
      wrapper = createWrapper()
      
      // Wait for all promises to resolve
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Assert that the API calls were made
      expect(gradesService.getDashboardStats).toHaveBeenCalled()
      expect(studentsService.getSections).toHaveBeenCalled()
      expect(subjectsService.getSubjectList).toHaveBeenCalled()
      
      // Assert that the data was set correctly
      expect(wrapper.vm.stats.totalStudents).toBe(100)
      expect(wrapper.vm.sections).toHaveLength(2)
      expect(wrapper.vm.subjects).toHaveLength(2)
    })
  })
  
  describe('handleAddStudent', () => {
    it('should add a new student', async () => {
      // Set up form data
      wrapper.vm.studentForm = {
        student_id: '12345',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        section: '1',
        date_of_birth: '2000-01-01'
      }
      
      // Mock the service
      studentsService.registerStudent.mockResolvedValueOnce({
        id: 1,
        ...wrapper.vm.studentForm
      })
      
      // Spy on loadStats
      const loadStatsSpy = vi.spyOn(wrapper.vm, 'loadStats')
      
      // Call the method
      await wrapper.vm.handleAddStudent()
      
      // Assert the service was called with correct data
      expect(studentsService.registerStudent).toHaveBeenCalledWith({
        student_id: '12345',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        section: 1, // Should be parsed to number
        date_of_birth: '2000-01-01'
      })
      
      // Assert loadStats was called
      expect(loadStatsSpy).toHaveBeenCalled()
      
      // Assert the modal was closed
      expect(wrapper.vm.showAddStudentModal).toBe(false)
      
      // Assert the form was reset
      expect(wrapper.vm.studentForm.student_id).toBe('')
    })
    
    it('should handle errors when adding a student', async () => {
      // Set up form data
      wrapper.vm.studentForm = {
        student_id: '12345',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        section: '1',
        date_of_birth: '2000-01-01'
      }
      
      // Mock a rejected promise
      const error = new Error('Network error')
      error.response = { data: { error: 'Failed to add student' } }
      studentsService.registerStudent.mockRejectedValueOnce(error)
      
      // Call the method
      await wrapper.vm.handleAddStudent()
      
      // Assert error state
      expect(wrapper.vm.error).toBe('Failed to add student')
      
      // Assert modal is still open
      expect(wrapper.vm.showAddStudentModal).toBe(true)
    })
  })
  
  describe('handleQuickEnroll', () => {
    it('should enroll a student in a subject', async () => {
      // Set up form data
      wrapper.vm.enrollForm = {
        student_id: '12345',
        subject_id: '1'
      }
      
      // Mock the services
      studentsService.getStudent.mockResolvedValueOnce({
        id: 1,
        student_id: '12345',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        section: 1
      })
      
      subjectsService.enrollStudent.mockResolvedValueOnce({
        id: 1,
        student: 1,
        subject: 1,
        enrollment_date: '2023-01-01T00:00:00Z'
      })
      
      // Spy on loadStats
      const loadStatsSpy = vi.spyOn(wrapper.vm, 'loadStats')
      
      // Call the method
      await wrapper.vm.handleQuickEnroll()
      
      // Assert the service was called with correct data
      expect(subjectsService.enrollStudent).toHaveBeenCalledWith({
        subject: '1',
        student: '12345'
      })
      
      // Assert loadStats was called
      expect(loadStatsSpy).toHaveBeenCalled()
      
      // Assert the modal was closed
      expect(wrapper.vm.showQuickEnrollModal).toBe(false)
      
      // Assert the form was reset
      expect(wrapper.vm.enrollForm.student_id).toBe('')
      expect(wrapper.vm.enrollForm.subject_id).toBe('')
    })
    
    it('should show error when student ID is missing', async () => {
      // Set up form data with missing student_id
      wrapper.vm.enrollForm = {
        student_id: '',
        subject_id: '1'
      }
      
      // Call the method
      await wrapper.vm.handleQuickEnroll()
      
      // Assert error message
      expect(wrapper.vm.error).toBe('Both student ID and subject are required')
      
      // Assert the service was not called
      expect(subjectsService.enrollStudent).not.toHaveBeenCalled()
    })
  })
  
  describe('handleAddSubject', () => {
    it('should add a new subject', async () => {
      // Set up form data
      wrapper.vm.subjectForm = {
        code: 'MATH101',
        name: 'Mathematics',
        description: 'Intro to Math',
        units: '3',
        year_level: '1',
        prerequisites: []
      }
      
      // Mock the service
      subjectsService.createSubject.mockResolvedValueOnce({
        id: 3,
        code: 'MATH101',
        name: 'Mathematics',
        units: 3,
        year_level: 1
      })
      
      // Spy on loadStats
      const loadStatsSpy = vi.spyOn(wrapper.vm, 'loadStats')
      
      // Call the method
      await wrapper.vm.handleAddSubject()
      
      // Assert the service was called with correct data
      expect(subjectsService.createSubject).toHaveBeenCalledWith({
        code: 'MATH101',
        name: 'Mathematics',
        description: 'Intro to Math',
        units: 3, // Should be parsed to number
        year_level: 1, // Should be parsed to number
        prerequisites: []
      })
      
      // Assert loadStats was called
      expect(loadStatsSpy).toHaveBeenCalled()
      
      // Assert the modal was closed
      expect(wrapper.vm.showAddSubjectModal).toBe(false)
      
      // Assert the form was reset
      expect(wrapper.vm.subjectForm.code).toBe('')
    })
  })
  
  describe('proceedToAssessment', () => {
    it('should navigate to assessments with selected subject', async () => {
      // Set selected subject
      wrapper.vm.selectedSubject = '123'
      
      // Call the method
      wrapper.vm.proceedToAssessment()
      
      // Assert navigation occurred
      expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Assessments',
        query: expect.objectContaining({
          subjectId: '123',
          redirectToSubject: 'true'
        })
      }))
      
      // Assert modal was closed
      expect(wrapper.vm.showSubjectSelectModal).toBe(false)
    })
    
    it('should not navigate if no subject is selected', () => {
      // Ensure no subject is selected
      wrapper.vm.selectedSubject = ''
      
      // Call the method
      wrapper.vm.proceedToAssessment()
      
      // Assert no navigation occurred
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
  
  describe('Modal Control Functions', () => {
    it('should close add student modal and reset form', () => {
      // Set modal to open
      wrapper.vm.showAddStudentModal = true
      
      // Call the method
      wrapper.vm.closeAddStudentModal()
      
      // Assert modal is closed
      expect(wrapper.vm.showAddStudentModal).toBe(false)
      
      // Assert form is reset
      expect(wrapper.vm.studentForm).toEqual({
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        section: '',
        date_of_birth: ''
      })
    })
    
    it('should close subject select modal', () => {
      // Set modal to open and select a subject
      wrapper.vm.showSubjectSelectModal = true
      wrapper.vm.selectedSubject = '123'
      
      // Call the method
      wrapper.vm.closeSubjectSelectModal()
      
      // Assert modal is closed and selection is cleared
      expect(wrapper.vm.showSubjectSelectModal).toBe(false)
      expect(wrapper.vm.selectedSubject).toBe('')
    })
    
    it('should close quick enroll modal and reset form', () => {
      // Set modal to open and fill form
      wrapper.vm.showQuickEnrollModal = true
      wrapper.vm.enrollForm = {
        student_id: '12345',
        subject_id: '1'
      }
      
      // Call the method
      wrapper.vm.closeQuickEnrollModal()
      
      // Assert modal is closed and form is reset
      expect(wrapper.vm.showQuickEnrollModal).toBe(false)
      expect(wrapper.vm.enrollForm).toEqual({
        student_id: '',
        subject_id: ''
      })
    })
    
    it('should close add subject modal and reset form', () => {
      // Set modal to open and fill form
      wrapper.vm.showAddSubjectModal = true
      wrapper.vm.subjectForm = {
        code: 'MATH101',
        name: 'Mathematics',
        description: 'Intro to Math',
        units: '3',
        year_level: '1',
        prerequisites: []
      }
      
      // Call the method
      wrapper.vm.closeAddSubjectModal()
      
      // Assert modal is closed and form is reset
      expect(wrapper.vm.showAddSubjectModal).toBe(false)
      expect(wrapper.vm.subjectForm).toEqual({
        code: '',
        name: '',
        description: '',
        units: 3,
        year_level: 1,
        prerequisites: []
      })
    })
  })
})
