from django.db import models

class Section(models.Model):
    name = models.CharField(max_length=50)
    year_level = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        ordinal = lambda n: "%d%s" % (n, {1: "st", 2: "nd", 3: "rd"}.get(n if n < 20 else n % 10, "th"))
        return f"Year {self.year_level} - {ordinal(int(self.name))} Section"

    class Meta:
        ordering = ['year_level', 'name']

class Student(models.Model):
    student_id = models.CharField(max_length=20, unique=True, db_index=True)
    first_name = models.CharField(max_length=50, db_index=True)
    last_name = models.CharField(max_length=50, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=15, blank=True, db_index=True)
    date_of_birth = models.DateField()
    address = models.TextField(blank=True)
    section = models.ForeignKey(
        Section, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='students',
        db_index=True
    )
    enrollment_date = models.DateField(auto_now_add=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['last_name', 'first_name'], name='name_idx'),
            models.Index(fields=['is_active', 'section'], name='active_section_idx'),
        ]
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.student_id} - {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
        
    @property
    def active_enrollments(self):
        return self.enrollments.filter(is_active=True)
        
    def is_enrolled_in(self, subject):
        return self.enrollments.filter(subject=subject, is_active=True).exists()
