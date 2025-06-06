# backend/apps/subjects/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
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
    print("\n=== Enrollment Request ===")
    print(f"Method: {request.method}")
    print(f"Content-Type: {request.content_type}")
    print(f"Raw data: {request.body}")
    print(f"Parsed data: {request.data}")
    print(f"Headers: {request.headers}")
    print(f"User: {request.user}")
    print(f"Auth: {request.auth}")
    print(f"Query params: {request.query_params}")
    
    try:
        # Ensure we have JSON data
        if not isinstance(request.data, dict):
            error_msg = 'Invalid request data format. Expected JSON object.'
            print(f"Validation error: {error_msg}")
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Get and validate request data
        subject_id = request.data.get('subject_id')
        student_id = request.data.get('student_id')
        
        print(f"Subject ID: {subject_id} (type: {type(subject_id)}), Student ID: {student_id} (type: {type(student_id)})")
        print(f"Full request data: {request.data}")
        
        if not subject_id:
            error_msg = 'subject_id is required'
            print(f"Validation error: {error_msg}")
            return Response(
                {'error': error_msg, 'field': 'subject_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not student_id:
            error_msg = 'student_id is required'
            print(f"Validation error: {error_msg}")
            return Response(
                {'error': error_msg, 'field': 'student_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert IDs to integers if they're strings
        try:
            subject_id = int(subject_id)
            student_id = int(student_id)
        except (ValueError, TypeError) as e:
            error_msg = f'Invalid ID format: {str(e)}'
            print(f"Validation error: {error_msg}")
            return Response(
                {'error': error_msg, 'details': 'IDs must be integers'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Get subject
        try:
            subject = Subject.objects.get(pk=subject_id)
            print(f"Found subject: {subject.id} - {subject.code} - {subject.name}")
        except Subject.DoesNotExist:
            error_msg = f'Subject with id {subject_id} not found'
            print(error_msg)
            return Response(
                {'error': error_msg, 'field': 'subject_id'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Get student by student_id (not primary key)
        try:
            student = Student.objects.get(student_id=student_id)
            print(f"Found student: {student.student_id} - {student.full_name}")
        except Student.DoesNotExist:
            error_msg = f'Student with ID {student_id} not found. Please check the student ID and try again.'
            print(error_msg)
            return Response(
                {'error': error_msg, 'field': 'student_id'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check for existing enrollment
        existing_enrollment = Enrollment.objects.filter(
            student=student, 
            subject=subject
        ).first()
        
        if existing_enrollment:
            if existing_enrollment.is_active:
                error_msg = 'Student is already enrolled in this subject'
                print(error_msg)
                return Response(
                    {
                        'error': error_msg,
                        'enrollment_id': existing_enrollment.id,
                        'is_active': True,
                        'enrollment_date': existing_enrollment.enrollment_date
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Reactivate existing enrollment
                print(f"Reactivating existing enrollment {existing_enrollment.id}")
                existing_enrollment.is_active = True
                existing_enrollment.enrollment_date = timezone.now().date()
                existing_enrollment.save(update_fields=['is_active', 'enrollment_date', 'updated_at'])
                enrollment = existing_enrollment
        else:
            # Create new enrollment
            print("Creating new enrollment")
            enrollment = Enrollment(
                student=student,
                subject=subject,
                enrollment_date=timezone.now().date(),
                is_active=True
            )
            try:
                enrollment.full_clean()
                enrollment.save()
                print(f"Created new enrollment: {enrollment.id}")
            except Exception as e:
                error_msg = f'Failed to create enrollment: {str(e)}'
                print(f"Error creating enrollment: {error_msg}")
                return Response(
                    {'error': error_msg, 'details': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Prepare success response
        response_data = {
            'message': 'Student enrolled successfully',
            'enrollment_id': enrollment.id,
            'student_id': student.id,
            'student_name': student.full_name,
            'subject_id': subject.id,
            'subject_name': subject.name,
            'enrollment_date': enrollment.enrollment_date,
            'is_active': enrollment.is_active
        }
        print(f"Enrollment successful: {response_data}")
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        error_msg = f'An unexpected error occurred: {str(e)}'
        print(f"\n=== ERROR in enroll_student ===")
        print(error_trace)
        print(f"Error details: {str(e)}")
        print("============================\n")
        
        return Response(
            {
                'error': error_msg,
                'details': str(e),
                'type': type(e).__name__
            }, 
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
def unenroll_student(request, pk):
    """Unenroll a student from a subject using enrollment ID"""
    try:
        print(f"Attempting to unenroll student with enrollment_id: {pk}")
        
        # Use update() instead of save() to avoid model validation
        updated = Enrollment.objects.filter(
            id=pk, 
            is_active=True
        ).update(is_active=False)
        
        if updated == 0:
            print(f"No active enrollment found with id: {pk}")
            return Response(
                {'error': 'Enrollment not found or already inactive'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        print(f"Successfully unenrolled student from enrollment {pk}")
        return Response({
            'message': 'Student unenrolled successfully'
        })
            
    except Exception as e:
        print(f"Error in unenroll_student: {str(e)}")
        return Response(
            {'error': 'An error occurred while unenrolling the student'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_enrollments(request):
    """
    List all enrollments with optional filtering.
    Query parameters:
    - is_active: Filter by active status (true/false)
    - subject_id: Filter by subject ID
    - student_id: Filter by student ID
    """
    queryset = Enrollment.objects.all()
    
    # Apply filters
    is_active = request.query_params.get('is_active')
    if is_active is not None:
        queryset = queryset.filter(is_active=is_active.lower() == 'true')
    
    subject_id = request.query_params.get('subject_id')
    if subject_id is not None:
        queryset = queryset.filter(subject_id=subject_id)
    
    student_id = request.query_params.get('student_id')
    if student_id is not None:
        queryset = queryset.filter(student_id=student_id)
    
    serializer = EnrollmentSerializer(queryset, many=True)
    return Response(serializer.data)
