# backend/apps/grades/serializers.py
from rest_framework import serializers
from .models import Assessment, Grade

class AssessmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = Assessment
        fields = [
            'id', 
            'name', 
            'subject', 
            'subject_name',  # Add this field
            'assessment_type', 
            'max_score', 
            'date'
        ]

    def validate_max_score(self, value):
        if value <= 0:
            raise serializers.ValidationError("Max score must be greater than 0")
        return value

class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    assessment_name = serializers.CharField(source='assessment.name', read_only=True)
    percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Grade
        fields = '__all__'
    
    def validate(self, data):
        """
        Check that the score doesn't exceed the assessment's max score.
        """
        score = data.get('score')
        assessment = data.get('assessment')
        
        # If this is an update, get the existing assessment if not provided
        if self.instance and not assessment:
            assessment = self.instance.assessment
        
        if score is not None and assessment and score > assessment.max_score:
            raise serializers.ValidationError(
                f"Score ({score}) cannot exceed the assessment's maximum score ({assessment.max_score})"
            )
        
        return data

class GradeBookSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    grades = serializers.DictField()
    total_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    average = serializers.DecimalField(max_digits=5, decimal_places=2)

class BulkGradeUpdateSerializer(serializers.Serializer):
    grades = serializers.ListField(
        child=serializers.DictField(
            child=serializers.DecimalField(max_digits=5, decimal_places=2)
        )
    )

class StudentGradeSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source='assessment.subject.name')
    assessment = serializers.CharField(source='assessment.name')
    max_score = serializers.DecimalField(source='assessment.max_score', max_digits=5, decimal_places=2)
    assessment_type = serializers.CharField(source='assessment.assessment_type')
    date = serializers.DateField(source='assessment.date')
    
    class Meta:
        model = Grade
        fields = [
            'id', 'subject', 'assessment', 'score',
            'max_score', 'percentage', 'assessment_type', 'date'
        ]
