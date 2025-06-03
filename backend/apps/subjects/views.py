# backend/apps/subjects/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Subject, Enrollment, GradeWeight
from .serializers import SubjectSerializer, GradeWeightSerializer
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.students.models import Student

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subject_list_create(request):
    if request.method == 'GET':
        subjects = Subject.objects.all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            subject = serializer.save()
            return Response(SubjectSerializer(subject).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def subject_detail(request, pk):
    subject = get_object_or_404(Subject, pk=pk)

    if request.method == 'GET':
        serializer = SubjectSerializer(subject)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = SubjectSerializer(subject, data=request.data)
        if serializer.is_valid():
            subject = serializer.save()
            return Response(SubjectSerializer(subject).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        subject.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subject_prerequisites(request, pk):
    subject = get_object_or_404(Subject, pk=pk)
    prerequisites = subject.prerequisites.all()
    serializer = SubjectSerializer(prerequisites, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_student(request):
    try:
        subject_id = request.data.get('subject_id')
        student_id = request.data.get('student_id')
        
        if not subject_id or not student_id:
            return Response(
                {'error': 'Both subject_id and student_id are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        subject = get_object_or_404(Subject, pk=subject_id)
        student = get_object_or_404(Student, pk=student_id)
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=student, subject=subject, is_active=True).exists():
            return Response(
                {'error': 'Student is already enrolled in this subject'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create enrollment
        enrollment = Enrollment.objects.create(
            student=student,
            subject=subject
        )
        
        return Response({
            'message': 'Student enrolled successfully',
            'enrollment_id': enrollment.id
        })
        
    except Subject.DoesNotExist:
        return Response(
            {'error': 'Subject not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_enroll(request, pk):
    """Enroll multiple students from selected sections in a subject"""
    subject = get_object_or_404(Subject, pk=pk)
    section_ids = request.data.get('section_ids', [])
    
    if not section_ids:
        return Response(
            {'error': 'section_ids list is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    results = {
        'successful': [],
        'failed': []
    }
    
    with transaction.atomic():
        # Get all students from selected sections
        students = Student.objects.filter(section_id__in=section_ids)
        
        for student in students:
            try:
                # Skip if already enrolled
                if Enrollment.objects.filter(
                    student=student, 
                    subject=subject, 
                    is_active=True
                ).exists():
                    results['failed'].append({
                        'student_id': student.id,
                        'name': student.full_name,
                        'reason': 'Already enrolled'
                    })
                    continue
                
                # Check prerequisites
                missing_prerequisites = []
                for prereq in subject.prerequisites.all():
                    if not Enrollment.objects.filter(
                        student=student, 
                        subject=prereq, 
                        is_active=True
                    ).exists():
                        missing_prerequisites.append(prereq.code)
                
                if missing_prerequisites:
                    results['failed'].append({
                        'student_id': student.id,
                        'name': student.full_name,
                        'reason': f"Missing prerequisites: {', '.join(missing_prerequisites)}"
                    })
                    continue
                
                # Create enrollment
                Enrollment.objects.create(
                    student=student,
                    subject=subject
                )
                results['successful'].append({
                    'student_id': student.id,
                    'name': student.full_name
                })
                
            except Exception as e:
                results['failed'].append({
                    'student_id': student.id,
                    'name': student.full_name,
                    'reason': str(e)
                })
    
    return Response({
        'message': f"Enrolled {len(results['successful'])} students successfully",
        'failed_count': len(results['failed']),
        'results': results
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unenroll_student(request, enrollment_id):
    """Unenroll a student from a subject using enrollment ID"""
    try:
        enrollment = get_object_or_404(Enrollment, id=enrollment_id, is_active=True)
        enrollment.is_active = False
        enrollment.save()
        
        return Response({
            'message': 'Student unenrolled successfully'
        })
    except Enrollment.DoesNotExist:
        return Response(
            {'error': 'Enrollment not found or already inactive'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrolled_students(request, pk):
    """Get list of students enrolled in a subject"""
    subject = get_object_or_404(Subject, pk=pk)
    enrollments = Enrollment.objects.filter(
        subject=subject,
        is_active=True
    ).select_related('student')
    
    students_data = [{
        'id': enrollment.student.id,
        'student_id': enrollment.student.student_id,
        'first_name': enrollment.student.first_name,
        'last_name': enrollment.student.last_name,
        'enrollment_date': enrollment.enrollment_date
    } for enrollment in enrollments]
    
    return Response(students_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_enrollments(request, student_id):
    """Get all enrollments for a specific student"""
    enrollments = Enrollment.objects.filter(
        student_id=student_id,
        is_active=True
    ).select_related('subject')
    
    data = [{
        'id': enrollment.id,
        'subject_code': enrollment.subject.code,
        'subject_name': enrollment.subject.name,
        'enrollment_date': enrollment.enrollment_date
    } for enrollment in enrollments]
    
    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_weights(request, pk):
    """Update grade weights for a subject"""
    try:
        subject = get_object_or_404(Subject, pk=pk)
        weights, created = GradeWeight.objects.get_or_create(subject=subject)
        
        serializer = GradeWeightSerializer(weights, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
