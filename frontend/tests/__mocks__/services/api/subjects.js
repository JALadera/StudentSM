// Mock implementation of subjects service
export const subjectsService = {
  getSubjectList: vi.fn().mockResolvedValue([
    { id: 1, code: 'MATH101', name: 'Mathematics', units: 3 },
    { id: 2, code: 'ENG101', name: 'English', units: 3 }
  ]),
  
  enrollStudent: vi.fn().mockResolvedValue({
    id: 1,
    student: 1,
    subject: 1,
    enrollment_date: '2023-01-01T00:00:00Z'
  }),
  
  createSubject: vi.fn().mockResolvedValue({
    id: 3,
    code: 'NEW101',
    name: 'New Subject',
    units: 3,
    year_level: 1
  })
}

export default subjectsService
