// Mock implementation of grades service
export const gradesService = {
  getDashboardStats: vi.fn().mockResolvedValue({
    total_students: 100,
    total_subjects: 20,
    total_sections: 5,
    total_enrollments: 500,
    year_level_stats: [
      { year_level: 1, count: 30 },
      { year_level: 2, count: 25 },
      { year_level: 3, count: 25 },
      { year_level: 4, count: 20 }
    ],
    subject_stats: [
      { subject_name: 'Math', enrollment_count: 50 },
      { subject_name: 'Science', enrollment_count: 45 },
      { subject_name: 'English', enrollment_count: 40 }
    ]
  })
}

export default gradesService
