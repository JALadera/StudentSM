from django.contrib import admin
from .models import Section, Student

class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'year_level', 'created_at')
    list_filter = ('year_level',)
    search_fields = ('name',)

class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'first_name', 'last_name', 'email', 'section', 'is_active')
    list_filter = ('section', 'is_active')
    search_fields = ('student_id', 'first_name', 'last_name', 'email')
    list_select_related = ('section',)

# Register models
admin.site.register(Section, SectionAdmin)
admin.site.register(Student, StudentAdmin)
