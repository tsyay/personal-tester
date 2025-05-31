from rest_framework import serializers
from .models import Course, Article, Test

class CourseSerializer(serializers.ModelSerializer):
    articles = serializers.SerializerMethodField()
    tests = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'articles', 'tests', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_articles(self, obj):
        articles = obj.articles.all()
        return [{
            'id': article.id,
            'title': article.title,
            'description': article.description,
            'total_pages': article.total_pages,
            'is_published': article.is_published,
            'created_at': article.created_at
        } for article in articles]

    def get_tests(self, obj):
        tests = obj.tests.all()
        return [{
            'id': test.id,
            'title': test.title,
            'description': test.description,
            'time_limit': test.time_limit,
            'total_questions': test.total_questions,
            'is_published': test.is_published,
            'created_at': test.created_at
        } for test in tests] 