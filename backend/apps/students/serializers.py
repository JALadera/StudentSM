# backend/apps/students/serializers.py
from rest_framework import serializers
from .models import Student, Section

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'name', 'year_level']

class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    section = SectionSerializer(read_only=True)  # Include full section details

    class Meta:
        model = Student
        fields = [
            'id', 
            'student_id', 
            'first_name', 
            'last_name',
            'full_name', 
            'email', 
            'date_of_birth',
            'section'  # Include section in fields
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class StudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

    def validate_student_id(self, value):
        if Student.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Student ID already exists")
        return value

class BulkStudentSerializer(serializers.Serializer):
    students = StudentCreateSerializer(many=True)

    def create(self, validated_data):
        students_data = validated_data['students']
        students = [Student(**student_data) for student_data in students_data]
        return Student.objects.bulk_create(students)
