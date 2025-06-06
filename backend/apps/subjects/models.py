# backend/apps/subjects/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.students.models import Student
from django.core.exceptions import ValidationError

class Subject(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    units = models.IntegerField()
    year_level = models.IntegerField()
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        ordering = ['year_level', 'code']

class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'subject'], 
                name='unique_student_subject',
                condition=models.Q(is_active=True)
            )
        ]
        indexes = [
            models.Index(fields=['student', 'subject']),
            models.Index(fields=['is_active']),
        ]

    def clean(self):
        # Check if an active enrollment already exists for this student and subject
        if self.is_active and Enrollment.objects.filter(
            student=self.student,
            subject=self.subject,
            is_active=True
        ).exclude(pk=self.pk).exists():
            raise ValidationError('Student is already enrolled in this subject')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        status = "active" if self.is_active else "inactive"
        return f"{self.student.full_name} - {self.subject.code} ({status})"

class GradeWeight(models.Model):
    subject = models.OneToOneField(
        'Subject', 
        on_delete=models.CASCADE, 
        related_name='subject_grade_weights'
    )
    activity_weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=30.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Weight for activities (percentage)"
    )
    quiz_weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=30.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Weight for quizzes (percentage)"
    )
    exam_weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=40.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Weight for exams (percentage)"
    )

    def clean(self):
        super().clean()
        # Validate all weights are present
        if not all(hasattr(self, field) for field in ['activity_weight', 'quiz_weight', 'exam_weight']):
            raise ValidationError('All weight fields are required')

        # Calculate total
        total = float(self.activity_weight or 0) + float(self.quiz_weight or 0) + float(self.exam_weight or 0)
        
        # Check if total equals 100%
        if abs(total - 100) > 0.01:  # Allow for small floating point differences
            raise ValidationError({
                'activity_weight': f'Weights must sum to 100%. Current total: {total}%'
            })

    def save(self, *args, **kwargs):
        self.full_clean()  # This will call clean() method
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Weights for {self.subject.code} (Act: {self.activity_weight}%, Quiz: {self.quiz_weight}%, Exam: {self.exam_weight}%)"
