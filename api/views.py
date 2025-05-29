from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import Test, Question, Answer, TestAttempt, StudentAnswer, Student, Article, ArticleImage
from .serializers import (
    StudentSerializer, StudentCreateSerializer, LoginSerializer,
    TestSerializer, QuestionSerializer, AnswerSerializer,
    TestAttemptSerializer, StudentAnswerSerializer,
    ArticleSerializer, ArticleImageSerializer
)
from django.db import models
from django.utils.text import slugify
import logging

logger = logging.getLogger(__name__)

# Create your views here.
def front(request):
    context = { }
    return render(request, "index.html", context)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_email(self, request):
        user = request.user
        if not user.check_password(request.data.get('password')):
            return Response({'error': 'Неверный пароль'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_email = request.data.get('email')
        if Student.objects.filter(email=new_email).exclude(id=user.id).exists():
            return Response({'error': 'Этот email уже используется'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.username = new_email
        user.save()
        return Response(self.get_serializer(user).data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        if not user.check_password(request.data.get('current_password')):
            return Response({'error': 'Неверный текущий пароль'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_password = request.data.get('new_password')
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Пароль успешно изменен'})

    @action(detail=False, methods=['post'])
    def change_role(self, request):
        user = request.user
        if not user.check_password(request.data.get('password')):
            return Response({'error': 'Неверный пароль'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_role = request.data.get('role')
        if new_role not in ['STUDENT', 'TEACHER']:
            return Response({'error': 'Неверная роль'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.role = new_role
        user.save()
        return Response(self.get_serializer(user).data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = StudentCreateSerializer(data=request.data)
        if serializer.is_valid():  # Use is_valid() instead of validate()
            user = serializer.save()  # Use save() which will call create()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': StudentSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': StudentSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Test.objects.prefetch_related('questions').all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        print(f"Retrieving test with ID: {kwargs.get('pk')}")  # Debug log
        print(f"Test exists: {instance is not None}")  # Debug log
        if instance:
            print(f"Test questions count: {instance.questions.count()}")  # Debug log
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        test = self.get_object()
        attempt = TestAttempt.objects.filter(student=request.user, test=test, completed=True).first()
        
        if not attempt:
            return Response({'error': 'Результаты не найдены'})

        answers = StudentAnswer.objects.filter(attempt=attempt)
        return Response({
            'test': TestSerializer(test).data,
            'answers': [answer.answer for answer in answers]
        })

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        test = self.get_object()
        answers = request.data.get('answers', [])
        
        attempt = TestAttempt.objects.create(
            student=request.user,
            test=test,
            completed=True
        )

        questions = list(test.questions.all())
        for question_index, answer in enumerate(answers):
            if question_index < len(questions):
                StudentAnswer.objects.create(
                    attempt=attempt,
                    question=questions[question_index],
                    answer=answer
                )

        return Response({'message': 'Тест завершен'})

    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        test = self.get_object()
        attempt = TestAttempt.objects.create(
            student=request.user,
            test=test
        )
        return Response(TestAttemptSerializer(attempt).data)

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        attempt = TestAttempt.objects.filter(
            student=request.user,
            test_id=pk
        ).first()

        if not attempt:
            attempt = TestAttempt.objects.create(
                student=request.user,
                test_id=pk
            )

        question = Question.objects.get(id=request.data.get('question_id'))
        answer_id = request.data.get('answer_id')
        text_answer = request.data.get('text_answer')

        student_answer = StudentAnswer.objects.create(
            attempt=attempt,
            question=question,
            answer_id=answer_id,
            text_answer=text_answer
        )

        return Response(StudentAnswerSerializer(student_answer).data)

    @action(detail=True, methods=['post'])
    def complete_attempt(self, request, pk=None):
        attempt = TestAttempt.objects.filter(
            student=request.user,
            test_id=pk
        ).first()

        if not attempt:
            attempt = TestAttempt.objects.create(
                student=request.user,
                test_id=pk
            )

        attempt.is_completed = True
        attempt.completed_at = timezone.now()
        attempt.save()

        return Response(TestAttemptSerializer(attempt).data)

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'TEACHER':
            return Article.objects.filter(creator=user)
        return Article.objects.filter(is_published=True)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        article = self.get_object()
        if article.creator != request.user:
            return Response({'error': 'Only the creator can publish this article'}, 
                          status=status.HTTP_403_FORBIDDEN)
        article.is_published = True
        article.save()
        return Response(self.get_serializer(article).data)

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        article = self.get_object()
        if article.creator != request.user:
            return Response({'error': 'Only the creator can unpublish this article'}, 
                          status=status.HTTP_403_FORBIDDEN)
        article.is_published = False
        article.save()
        return Response(self.get_serializer(article).data)

    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        article = self.get_object()
        if 'image' not in request.FILES:
            return Response({'error': 'No image provided'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        image = request.FILES['image']
        article_image = ArticleImage.objects.create(
            article=article,
            image=image
        )
        return Response({'image_url': article_image.image.url})

