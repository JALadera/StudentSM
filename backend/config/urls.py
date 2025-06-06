from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings

def health_check(request):
    """Basic health check endpoint"""
    return JsonResponse({"status": "ok", "environment": settings.ENVIRONMENT if hasattr(settings, 'ENVIRONMENT') else 'development'})

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/subjects/', include('apps.subjects.urls')),
    path('api/grades/', include('apps.grades.urls')),
    path('api/health/', include('apps.health.urls')),  # Health check endpoint
    
    # Root health check
    path('', csrf_exempt(health_check), name='root_health_check'),
]

# CORS headers are already handled by django-cors-headers middleware
# No need for custom middleware as we've configured CORS settings in settings.py
