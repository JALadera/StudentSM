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

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    pagination_class = StudentPagination

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_list_create(request):
    if request.method == 'GET':
        students = Student.objects.all().select_related('section')
        print('Fetching students:', students.count()) # Debug log
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
    sections = Section.objects.all()
    print('Fetched sections:', sections)  # Add this line
    serializer = SectionSerializer(sections, many=True)
    return Response(serializer.data)
