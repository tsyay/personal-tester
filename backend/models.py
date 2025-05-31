from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    title = models.CharField(max_length=200, verbose_name="Название курса")
    articles = models.ManyToManyField('Article', related_name='courses', blank=True, verbose_name="Статьи")
    tests = models.ManyToManyField('Test', related_name='courses', blank=True, verbose_name="Тесты")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Курс"
        verbose_name_plural = "Курсы"
        ordering = ['-created_at']

    def __str__(self):
        return self.title 