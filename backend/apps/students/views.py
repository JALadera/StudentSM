# backend/apps/students/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Student, Section
from .serializers import StudentSerializer, StudentCreateSerializer, BulkStudentSerializer, SectionSerializer
from rest_framework.pagination import PageNumberPagination

class StudentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'per_page'
    max_page_size = 100

from django.db.models import Q
from rest_framework import filters

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().select_related('section')
    serializer_class = StudentSerializer
    pagination_class = StudentPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'student_id', 'email']
    ordering_fields = ['last_name', 'first_name', 'student_id', 'email']
    ordering = ['last_name', 'first_name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Apply section filter if provided
        section = self.request.query_params.get('section')
        if section:
            queryset = queryset.filter(section_id=section)
            
        # Apply active status filter if provided
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_list_create(request):
    if request.method == 'GET':
        # Get query parameters
        search = request.query_params.get('search', '')
        section = request.query_params.get('section')
        ordering = request.query_params.get('ordering', 'last_name,first_name')
        
        # Start with base queryset
        students = Student.objects.all().select_related('section')
        
        # Apply filters
        if search:
            students = students.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(student_id__icontains=search) |
                Q(email__icontains=search)
            )
        
        if section:
            students = students.filter(section_id=section)
        
        # Apply ordering
        students = students.order_by(*ordering.split(','))
        
        # Apply pagination
        paginator = StudentPagination()
        page = paginator.paginate_queryset(students, request)
        
        if page is not None:
            serializer = StudentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        # Fallback if pagination is not used
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = StudentCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):
    try:
        student = get_object_or_404(Student.objects.select_related('section'), pk=pk)
        
        if request.method == 'GET':
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = StudentSerializer(student, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            student.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_register_students(request):
    serializer = BulkStudentSerializer(data=request.data)
    if serializer.is_valid():
        students = serializer.save()
        return Response({
            'message': f'{len(students)} students registered successfully',
            'students': StudentSerializer(students, many=True).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def assign_to_section(request, pk):
    """Assign a student to a section"""
    try:
        student = get_object_or_404(Student, pk=pk)
        section_id = request.data.get('section_id')
        
        if not section_id:
            return Response(
                {'error': 'Section ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        section = get_object_or_404(Section, pk=section_id)
        student.section = section
        student.save()
        
        return Response({
            'message': 'Section assigned successfully',
            'section': {
                'id': section.id,
                'name': section.name,
                'year_level': section.year_level
            }
        })
        
    except Section.DoesNotExist:
        return Response(
            {'error': 'Section not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def section_list(request):
    print('\n=== Section List View ===')
    print('Request method:', request.method)
    print('Request path:', request.path)
    print('Request headers:', dict(request.headers))
    
    try:
        sections = Section.objects.all()
        print(f'Fetched {sections.count()} sections')
        
        # Print first few sections for debugging
        for i, section in enumerate(sections[:3]):
            print(f'Section {i+1}: {section}')
            
        serializer = SectionSerializer(sections, many=True)
        print('Serialization successful')
        return Response(serializer.data)
        
    except Exception as e:
        print(f'Error in section_list view: {str(e)}')
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_assign_section(request):
    """
    Assign multiple students to a section in bulk
    Expected payload:
    {
        "student_ids": [1, 2, 3],
        "section_id": 1
    }
    """
    try:
        student_ids = request.data.get('student_ids', [])
        section_id = request.data.get('section_id')
        
        if not student_ids or not section_id:
            return Response(
                {'error': 'Both student_ids and section_id are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the section
        try:
            section = Section.objects.get(id=section_id)
        except Section.DoesNotExist:
            return Response(
                {'error': 'Section not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update all students at once
        updated_count = Student.objects.filter(id__in=student_ids).update(section=section)
        
        return Response({
            'message': f'Successfully assigned {updated_count} students to {section.name}',
            'updated_count': updated_count
        })
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f'Error in bulk_assign_section: {str(e)}', exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
