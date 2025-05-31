from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import EmailValidator, FileExtensionValidator
from django.utils.text import slugify

class Student(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        ADMIN = 'ADMIN', 'Administrator'
        TEACHER = 'TEACHER', 'Teacher'

    class Position(models.TextChoices):
        WAITER = 'WAITER', 'Официант'
        BARTENDER = 'BARTENDER', 'Бармен'
        MANAGER = 'MANAGER', 'Менеджер'
        CLEANER = 'CLEANER', 'Уборщик'
        COOK = 'COOK', 'Повар'

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

    # Add position field
    position = models.CharField(
        max_length=20,
        choices=Position.choices,
        default=Position.WAITER,
        verbose_name='Должность'
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

class Test(models.Model):
    class TestType(models.TextChoices):
        MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', 'Multiple Choice'
        TEXT_INPUT = 'TEXT_INPUT', 'Text Input'
        MIXED = 'MIXED', 'Mixed'

    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='created_tests')
    test_type = models.CharField(max_length=20, choices=TestType.choices, default=TestType.MULTIPLE_CHOICE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    time_limit = models.IntegerField(default=0, help_text="Time limit in minutes (0 for no limit)")
    questions = models.ManyToManyField('Question', related_name='tests', blank=True)
    positions = models.ManyToManyField('Position', related_name='tests', blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Position(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Question(models.Model):
    text = models.TextField()
    image = models.ImageField(upload_to='question_images/', null=True, blank=True)
    order = models.IntegerField(default=0)
    points = models.IntegerField(default=1)
    question_type = models.CharField(
        max_length=20,
        choices=Test.TestType.choices,
        default=Test.TestType.MULTIPLE_CHOICE
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Question {self.order}"

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Answer for {self.question}"

class TestAttempt(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='test_attempts')
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.full_name} - {self.test.title}"

class StudentAnswer(models.Model):
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(Answer, on_delete=models.SET_NULL, null=True, blank=True)
    text_answer = models.TextField(null=True, blank=True)
    is_correct = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.selected_answer:
            self.is_correct = self.selected_answer.is_correct
        elif self.text_answer is not None:
            # For text input questions, check if the answer matches any correct answer
            correct_answers = self.question.answers.filter(is_correct=True)
            self.is_correct = any(
                correct_answer.text.lower().strip() == self.text_answer.lower().strip()
                for correct_answer in correct_answers
            )
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['question__id']

    def __str__(self):
        return f"Answer for {self.question} by {self.attempt.student.full_name}"

class Article(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(help_text="Краткое описание статьи", null=True, blank=True)
    creator = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    featured_image = models.ImageField(upload_to='articles/', null=True, blank=True)
    total_pages = models.IntegerField(default=1)
    positions = models.ManyToManyField(Position, related_name='articles', blank=True)

    def __str__(self):
        return self.title

class ArticlePage(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='pages')
    title = models.CharField(max_length=200)
    content = models.TextField()
    page_number = models.IntegerField()
    image = models.ImageField(upload_to='articles/pages/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page_number']
        unique_together = ['article', 'page_number']

    def __str__(self):
        return f"{self.article.title} - Page {self.page_number}"

class ArticleProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='article_progress')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='progress')
    current_page = models.IntegerField(default=1)
    last_read_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ['student', 'article']

    def __str__(self):
        return f"{self.student.full_name} - {self.article.title}"

    @property
    def progress_percentage(self):
        return (self.current_page / self.article.total_pages) * 100 if self.article.total_pages > 0 else 0

class Course(models.Model):
    title = models.CharField(max_length=200, verbose_name="Название курса")
    articles = models.ManyToManyField(Article, related_name='courses', blank=True, verbose_name="Статьи")
    tests = models.ManyToManyField(Test, related_name='courses', blank=True, verbose_name="Тесты")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    positions = models.ManyToManyField(Position, related_name='courses', blank=True)

    class Meta:
        verbose_name = "Курс"
        verbose_name_plural = "Курсы"
        ordering = ['-created_at']

    def __str__(self):
        return self.title
