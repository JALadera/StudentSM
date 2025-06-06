# backend/apps/subjects/serializers.py
from rest_framework import serializers
from .models import Subject, Enrollment, GradeWeight
from apps.students.serializers import StudentSerializer

class PrerequisiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'code', 'name']

class GradeWeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeWeight
        fields = ['activity_weight', 'quiz_weight', 'exam_weight']

    def validate(self, data):
        total = sum(float(data.get(f, 0)) for f in ['activity_weight', 'quiz_weight', 'exam_weight'])
        if abs(total - 100) > 0.01:  # Allow for floating point imprecision
            raise serializers.ValidationError("Weights must sum to 100%")
        return data

class SubjectSerializer(serializers.ModelSerializer):
    prerequisites = PrerequisiteSerializer(many=True, read_only=True)
    subject_grade_weights = GradeWeightSerializer(required=False)
    enrollment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = ['id', 'code', 'name', 'description', 'units', 
                 'year_level', 'prerequisites', 'subject_grade_weights', 'enrollment_count']

    def get_enrollment_count(self, obj):
        # Get all active enrollments for this subject
        enrollments = obj.enrollments.filter(is_active=True)
        # Count unique students (since a student can be enrolled in multiple sections)
        return enrollments.values('student').distinct().count()

    def create(self, validated_data):
        prerequisites = self.initial_data.get('prerequisites', [])
        weights_data = validated_data.pop('grade_weights', None)
        instance = Subject.objects.create(**validated_data)
        if prerequisites:
            instance.prerequisites.set(prerequisites)
        if weights_data:
            GradeWeight.objects.create(subject=instance, **weights_data)
        else:
            GradeWeight.objects.create(subject=instance)  # Create with defaults
        return instance

    def update(self, instance, validated_data):
        # Get grade_weights data if provided
        weights_data = validated_data.pop('subject_grade_weights', None)
        
        # Update all basic fields
        instance.code = validated_data.get('code', instance.code)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.units = validated_data.get('units', instance.units)
        instance.year_level = validated_data.get('year_level', instance.year_level)
        
        # Handle prerequisites if provided in the request
        if 'prerequisites' in self.initial_data:
            instance.prerequisites.set(self.initial_data['prerequisites'])
        
        # Save the instance
        instance.save()
        
        # Handle grade weights if provided
        if weights_data is not None:
            weights, _ = GradeWeight.objects.get_or_create(subject=instance)
            for attr, value in weights_data.items():
                setattr(weights, attr, value)
            weights.full_clean()  # Validate weights before saving
            weights.save()
        
        return instance

class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'

class EnrollStudentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()

class BulkEnrollSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField())
