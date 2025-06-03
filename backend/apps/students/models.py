# backend/apps/students/models.py
from django.db import models

class Section(models.Model):
    name = models.CharField(max_length=50)
    year_level = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Convert section name to ordinal number (1 -> 1st, 2 -> 2nd, etc.)
        ordinal = lambda n: "%d%s" % (n, {1: "st", 2: "nd", 3: "rd"}.get(n if n < 20 else n % 10, "th"))
        return f"Year {self.year_level} - {ordinal(int(self.name))} Section"

    class Meta:
        ordering = ['year_level', 'name']  # Order by year level then section number

class Student(models.Model):
    student_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField()
    address = models.TextField(blank=True)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True,related_name='students')
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student_id} - {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
