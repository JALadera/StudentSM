# backend/apps/grades/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Assessment, Grade
from .serializers import AssessmentSerializer, GradeSerializer, GradeBookSerializer, BulkGradeUpdateSerializer
from apps.students.models import Student, Section
from apps.subjects.models import Subject, Enrollment
from django.db.models import Sum

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def assessment_list_create(request):
    """List all assessments or create a new assessment"""
    if request.method == 'GET':
        subject_id = request.query_params.get('subject')
        assessments = Assessment.objects.all()
        
        if subject_id:
            assessments = assessments.filter(subject_id=subject_id)
            
        serializer = AssessmentSerializer(assessments, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        serializer = AssessmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_assessment(request):
    serializer = AssessmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def activities_view(request):
    if request.method == 'GET':
        subject_id = request.query_params.get('subject')
        activities = Assessment.objects.filter(
            assessment_type='activity',
            subject_id=subject_id
        ) if subject_id else Assessment.objects.filter(assessment_type='activity')
        serializer = AssessmentSerializer(activities, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        data = request.data.copy()
        data['assessment_type'] = 'activity'
        serializer = AssessmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def quizzes_view(request):
    if request.method == 'GET':
        subject_id = request.query_params.get('subject')
        quizzes = Assessment.objects.filter(
            assessment_type='quiz',
            subject_id=subject_id
        ) if subject_id else Assessment.objects.filter(assessment_type='quiz')
        serializer = AssessmentSerializer(quizzes, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        data = request.data.copy()
        data['assessment_type'] = 'quiz'
        serializer = AssessmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def exams_view(request):
    if request.method == 'GET':
        subject_id = request.query_params.get('subject')
        exams = Assessment.objects.filter(
            assessment_type='exam',
            subject_id=subject_id
        ) if subject_id else Assessment.objects.filter(assessment_type='exam')
        serializer = AssessmentSerializer(exams, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        data = request.data.copy()
        data['assessment_type'] = 'exam'
        serializer = AssessmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gradebook_view(request, section_id):
    subject_id = request.GET.get('subject')
    if not subject_id:
        return Response({'error': 'Subject ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    subject = get_object_or_404(Subject, pk=subject_id)
    enrollments = Enrollment.objects.filter(
        subject=subject,
        student__section_id=section_id,
        is_active=True
    ).select_related('student')
    
    assessments = Assessment.objects.filter(subject=subject)
    gradebook_data = []
    
    for enrollment in enrollments:
        student = enrollment.student
        grades = Grade.objects.filter(
            student=student,
            assessment__subject=subject
        ).select_related('assessment')
        
        grade_dict = {}
        total_score = 0
        max_total = 0
        
        for assessment in assessments:
            grade = grades.filter(assessment=assessment).first()
            if grade:
                grade_dict[assessment.name] = grade.score
                total_score += grade.score
            else:
                grade_dict[assessment.name] = 0
            max_total += assessment.max_score
        
        average = (total_score / max_total * 100) if max_total > 0 else 0
        
        gradebook_data.append({
            'student_id': student.id,
            'student_name': student.full_name,
            'grades': grade_dict,
            'total_score': total_score,
            'average': round(average, 2)
        })
    
    return Response(gradebook_data)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def assessment_detail(request, pk):
    """Retrieve, update or delete an assessment"""
    try:
        assessment = Assessment.objects.get(pk=pk)
    except Assessment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = AssessmentSerializer(assessment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        assessment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def bulk_update_grades(request):
    serializer = BulkGradeUpdateSerializer(data=request.data)
    if serializer.is_valid():
        grades_data = serializer.validated_data['grades']
        updated_grades = []
        
        for grade_data in grades_data:
            student_id = grade_data.get('student_id')
            assessment_id = grade_data.get('assessment_id')
            score = grade_data.get('score')
            
            if student_id and assessment_id and score is not None:
                grade, created = Grade.objects.update_or_create(
                    student_id=student_id,
                    assessment_id=assessment_id,
                    defaults={'score': score}
                )
                updated_grades.append(grade)
        
        return Response({
            'message': f'{len(updated_grades)} grades updated successfully'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def grade_list_create(request):
    if request.method == 'GET':
        grades = Grade.objects.all()
        student_id = request.GET.get('student')
        subject_id = request.GET.get('subject')
        
        if student_id:
            grades = grades.filter(student_id=student_id)
        if subject_id:
            grades = grades.filter(assessment__subject_id=subject_id)
        
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = GradeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_grades(request, student_id):
    """Get final grades for all subjects of a student"""
    try:
        # Get all enrollments for the student
        enrollments = Enrollment.objects.filter(student_id=student_id).select_related('subject')
        
        grades_data = []
        for enrollment in enrollments:
            final_grade = calculate_final_grade(student_id, enrollment.subject.id)
            
            grades_data.append({
                'subject_code': enrollment.subject.code,
                'subject_name': enrollment.subject.name,
                'final_grade': round(final_grade, 2),
                'status': get_grade_status(final_grade)
            })
        
        return Response(grades_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_grades(request, student_id):
    try:
        student = get_object_or_404(Student, pk=student_id)
        grades = Grade.objects.filter(student=student)\
            .select_related('assessment', 'assessment__subject')\
            .order_by('assessment__date')
            
        data = []
        for grade in grades:
            data.append({
                'id': grade.id,
                'subject': {
                    'id': grade.assessment.subject.id,
                    'code': grade.assessment.subject.code,
                    'name': grade.assessment.subject.name
                },
                'assessment': {
                    'id': grade.assessment.id,
                    'name': grade.assessment.name,
                    'type': grade.assessment.assessment_type,
                    'max_score': grade.assessment.max_score,
                    'date': grade.assessment.date
                },
                'score': grade.score,
                'status': get_grade_status(grade.score, grade.assessment.max_score)
            })
            
        return Response(data)
        
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

def get_grade_status(score, max_score):
    percentage = (score / max_score) * 100
    if percentage >= 90:
        return 'Excellent'
    elif percentage >= 80:
        return 'Good'
    elif percentage >= 75:
        return 'Passing'
    return 'Failed'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_grade(request):
    """Update a student's grade for an assessment"""
    try:
        data = request.data
        student_id = data.get('student')
        assessment_id = data.get('assessment')
        score = data.get('score')

        # Validate required fields
        if not all([student_id, assessment_id, score is not None]):
            return Response(
                {'error': 'Missing required fields'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create grade
        grade, created = Grade.objects.update_or_create(
            student_id=student_id,
            assessment_id=assessment_id,
            defaults={'score': score}
        )

        serializer = GradeSerializer(grade)
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def calculate_final_grade(student_id, subject_id):
    subject = Subject.objects.get(id=subject_id)
    weights = subject.grade_weights
    
    # Get grades by category
    activities = Grade.objects.filter(
        student_id=student_id,
        assessment__subject_id=subject_id,
        assessment__assessment_type='activity'
    )
    quizzes = Grade.objects.filter(
        student_id=student_id,
        assessment__subject_id=subject_id,
        assessment__assessment_type='quiz'
    )
    exams = Grade.objects.filter(
        student_id=student_id,
        assessment__subject_id=subject_id,
        assessment__assessment_type='exam'
    )
    
    # Calculate category averages
    activity_avg = calculate_category_average(activities) * (weights.activity_weight / 100)
    quiz_avg = calculate_category_average(quizzes) * (weights.quiz_weight / 100)
    exam_avg = calculate_category_average(exams) * (weights.exam_weight / 100)
    
    return activity_avg + quiz_avg + exam_avg

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """Get statistics for dashboard"""
    try:
        # Basic stats
        basic_stats = {
            'total_students': Student.objects.count(),
            'total_subjects': Subject.objects.count(),
            'total_sections': Section.objects.count(),
            'total_enrollments': Enrollment.objects.count(),
        }

        # Year level statistics
        year_level_stats = []
        for year in range(1, 5):  # Assuming 4 year levels
            sections = Section.objects.filter(year_level=year)
            students = Student.objects.filter(section__year_level=year)
            
            year_level_stats.append({
                'level': year,
                'sectionCount': sections.count(),
                'totalStudents': students.count(),
                'averagePerSection': round(students.count() / sections.count() if sections.count() > 0 else 0, 1)
            })

        # Subject distribution
        subject_stats = []
        for year in range(1, 5):
            subjects = Subject.objects.filter(year_level=year)
            subject_stats.append({
                'level': year,
                'totalSubjects': subjects.count(),
                'totalUnits': subjects.aggregate(Sum('units'))['units__sum'] or 0
            })

        return Response({
            **basic_stats,
            'year_level_stats': year_level_stats,
            'subject_stats': subject_stats
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
