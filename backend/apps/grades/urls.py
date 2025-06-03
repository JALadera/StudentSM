from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.get_dashboard_stats, name='dashboard-stats'),
    path('activities/', views.activities_view, name='activities'),
    path('quizzes/', views.quizzes_view, name='quizzes'),
    path('exams/', views.exams_view, name='exams'),
    path('gradebook/<int:section_id>/', views.gradebook_view, name='gradebook'),
    path('assessments/', views.assessment_list_create, name='assessment-list-create'),
    path('assessments/<int:pk>/', views.assessment_detail, name='assessment-detail'),
    path('student-grades/<int:student_id>/', views.get_student_grades, name='student-grades'),
    path('update/', views.update_grade, name='update-grade'),
    path('bulk-update/', views.bulk_update_grades, name='bulk-update-grades'),
]