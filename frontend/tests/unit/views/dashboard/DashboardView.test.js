import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useRouter } from 'vue-router'

// Mock the services
vi.mock('@/services/api/students')
vi.mock('@/services/api/subjects')
vi.mock('@/services/api/grades')
vi.mock('vue-router')

describe('DashboardView.vue', () => {
  let wrapper
  let mockRouter
  
  const createWrapper = () => {
    mockRouter = {
      push: vi.fn()
    }
    useRouter.mockReturnValue(mockRouter)
    
    return mount(DashboardView, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          'BulkRegisterModal': true,
          'BulkSectionWizard': true,
          'BulkEnrollModal': true
        }
      }
    })
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = createWrapper()
  })
  
  describe('loadStats', () => {
    it('should load dashboard statistics', async () => {
      // Mock the gradesService.getDashboardStats response
      const mockStats = {
        total_students: 100,
        total_subjects: 20,
        total_sections: 5,
        total_enrollments: 500,
        year_level_stats: [],
        subject_stats: []
      }
      
      // Set up the mock implementation
      wrapper.vm.gradesService.getDashboardStats.mockResolvedValue(mockStats)
      
      // Call the method
      await wrapper.vm.loadStats()
      
      // Assert the stats were updated
      expect(wrapper.vm.stats).toEqual({
        totalStudents: 100,
        totalSubjects: 20,
        totalSections: 5,
        totalEnrollments: 500
      })
    })
    
    it('should handle errors when loading stats', async () => {
      // Mock a rejected promise
      wrapper.vm.gradesService.getDashboardStats.mockRejectedValue(new Error('Network error'))
      
      // Call the method
      await wrapper.vm.loadStats()
      
      // Assert error state
      expect(wrapper.vm.error).toBe('Failed to load dashboard statistics')
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
      wrapper.vm.studentsService.registerStudent.mockResolvedValue({})
      
      // Spy on loadStats
      const loadStatsSpy = vi.spyOn(wrapper.vm, 'loadStats')
      
      // Call the method
      await wrapper.vm.handleAddStudent()
      
      // Assert the service was called with correct data
      expect(wrapper.vm.studentsService.registerStudent).toHaveBeenCalledWith({
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
    })
  })
  
  describe('proceedToAssessment', () => {
    it('should navigate to assessments with selected subject', () => {
      // Set selected subject
      wrapper.vm.selectedSubject = '123'
      
      // Call the method
      wrapper.vm.proceedToAssessment()
      
      // Assert navigation occurred
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'Assessments',
        query: expect.objectContaining({
          subjectId: '123',
          redirectToSubject: 'true'
        })
      })
      
      // Assert modal was closed
      expect(wrapper.vm.showSubjectSelectModal).toBe(false)
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
      wrapper.vm.studentsService.getStudent.mockResolvedValue({
        student_id: '12345',
        first_name: 'John',
        last_name: 'Doe'
      })
      
      wrapper.vm.subjectsService.enrollStudent.mockResolvedValue({})
      
      // Spy on loadStats
      const loadStatsSpy = vi.spyOn(wrapper.vm, 'loadStats')
      
      // Call the method
      await wrapper.vm.handleQuickEnroll()
      
      // Assert the service was called with correct data
      expect(wrapper.vm.subjectsService.enrollStudent).toHaveBeenCalledWith({
        subject: '1',
        student: '12345'
      })
      
      // Assert loadStats was called
      expect(loadStatsSpy).toHaveBeenCalled()
      
      // Assert the modal was closed
      expect(wrapper.vm.showQuickEnrollModal).toBe(false)
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
      wrapper.vm.subjectsService.createSubject.mockResolvedValue({})
      
      // Spy on loadStats
      const loadStatsSpy = vi.spyOn(wrapper.vm, 'loadStats')
      
      // Call the method
      await wrapper.vm.handleAddSubject()
      
      // Assert the service was called with correct data
      expect(wrapper.vm.subjectsService.createSubject).toHaveBeenCalledWith({
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
    
    // Add similar tests for other modal control functions
  })
})
