// Mock implementation of students service
export const studentsService = {
  getStudent: vi.fn().mockImplementation((id) => {
    return Promise.resolve({
      id: 1,
      student_id: id,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      section: 1
    })
  }),
  
  getSections: vi.fn().mockResolvedValue([
    { id: 1, name: 'Section A', year_level: 1 },
    { id: 2, name: 'Section B', year_level: 2 }
  ]),
  
  registerStudent: vi.fn().mockResolvedValue({ id: 1, success: true })
}

export default studentsService
