# backend/apps/students/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.student_list_create, name='student-list-create'),
    path('<int:pk>/', views.student_detail, name='student-detail'),
    path('bulk-register/', views.bulk_register_students, name='bulk_register'),
    path('<int:pk>/section/', views.assign_to_section, name='assign-to-section'),
    path('sections/', views.section_list, name='section-list'),
]
