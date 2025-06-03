# backend/apps/grades/models.py
from django.db import models
from apps.students.models import Student
from apps.subjects.models import Subject


class Assessment(models.Model):
    TYPES = (
        ('activity', 'Activity'),
        ('quiz', 'Quiz'),
        ('exam', 'Exam'),
    )

    name = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assessments')
    assessment_type = models.CharField(max_length=10, choices=TYPES)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    date = models.DateField(null=True, blank= True, help_text="Date of the assessment")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_assessment_type_display()})"

class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    remarks = models.TextField(blank=True)
    date_recorded = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'assessment']

    def __str__(self):
        return f"{self.student.full_name} - {self.assessment.name}: {self.score}"

    @property
    def percentage(self):
        return (self.score / self.assessment.max_score) * 100 if self.assessment.max_score > 0 else 0

