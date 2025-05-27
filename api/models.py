from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import EmailValidator

class Student(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        ADMIN = 'ADMIN', 'Administrator'
        TEACHER = 'TEACHER', 'Teacher'

    # Override username field to use email instead
    username = models.EmailField(
        'Email address',
        unique=True,
        validators=[EmailValidator()],
        error_messages={
            'unique': "A user with that email already exists.",
        }
    )
    
    # Add role field
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    
    # Add full name field
    full_name = models.CharField(
        max_length=255,
        verbose_name='Full Name'
    )

    # Set email as the USERNAME_FIELD
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.full_name} ({self.username})"
