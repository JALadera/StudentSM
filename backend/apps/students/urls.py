# backend/apps/students/urls.py
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from . import views
from django.http import JsonResponse, Http404
import logging

# Set up logging
logger = logging.getLogger(__name__)

class Debug404View(APIView):
    """Debug view to log 404 errors"""
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        logger.error(f"404 Error - Requested URL: {request.path}")
        logger.error(f"Available URL patterns:")
        for url in urlpatterns:
            logger.error(f"- {url.pattern}")
        return Response(
            {'detail': 'Not found', 'path': request.path},
            status=status.HTTP_404_NOT_FOUND
        )

router = DefaultRouter()
router.register(r'', views.StudentViewSet, basename='student')

# Debug view to test URL patterns
def debug_view(request):
    return JsonResponse({
        'message': 'Debug endpoint reached',
        'path': request.path,
        'method': request.method,
    })

# Test view that doesn't require authentication
@api_view(['GET'])
@permission_classes([AllowAny])
def test_view(request):
    return Response({
        'message': 'Test endpoint is working!',
        'path': request.path,
        'method': request.method,
    })

# Regular URL patterns
urlpatterns = [
    # API endpoints
    path('sections/', views.section_list, name='section-list'),
    path('sections', views.section_list, name='section-list-no-slash'),
    
    # Other endpoints
    path('debug/', debug_view, name='debug'),
    path('test/', test_view, name='test'),
    path('bulk-register/', views.bulk_register_students, name='bulk_register'),
    path('bulk-assign-section/', views.bulk_assign_section, name='bulk-assign-section'),
    path('<int:pk>/section/', views.assign_to_section, name='assign-to-section'),
    
    # Student by student_id (not primary key)
    path('by-student-id/<str:student_id>/', views.student_by_student_id, name='student-by-student-id'),
    
    # Include router URLs last to avoid conflicts
    path('', include(router.urls)),
]

# Debug 404 handler
handler404 = Debug404View.as_view()
