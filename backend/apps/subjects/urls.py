# backend/apps/subjects/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.subject_list_create, name='subject-list-create'),
    path('<int:pk>/', views.subject_detail, name='subject-detail'),
    path('enroll/', views.enroll_student, name='enroll-student'),
    path('<int:pk>/bulk-enroll/', views.bulk_enroll, name='bulk-enroll'),
    path('enrollments/', views.list_enrollments, name='list-enrollments'),
    path('enrollments/<int:pk>/', views.unenroll_student, name='unenroll-student'),
    path('student-enrollments/<int:student_id>/', views.student_enrollments, name='student-enrollments'),
    path('<int:pk>/weights/', views.update_weights, name='update-weights'),
]
