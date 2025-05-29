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
        try:
            test = self.get_object()
            attempt = TestAttempt.objects.filter(
                student=request.user,
                test=test,
                is_completed=True
            ).first()
            
            if not attempt:
                return Response({'error': 'Результаты не найдены'}, status=status.HTTP_404_NOT_FOUND)

            # Get all student answers for this attempt
            student_answers = StudentAnswer.objects.filter(attempt=attempt).select_related('question', 'answer')
            
            # Calculate score
            total_questions = test.questions.count()
            correct_answers = student_answers.filter(is_correct=True).count()
            score = (correct_answers / total_questions * 100) if total_questions > 0 else 0

            # Update attempt score
            attempt.score = score
            attempt.save()

            return Response({
                'test': TestSerializer(test).data,
                'attempt': {
                    'id': attempt.id,
                    'score': score,
                    'completed_at': attempt.completed_at,
                    'answers': [{
                        'question_id': answer.question.id,
                        'question_text': answer.question.text,
                        'selected_answer': answer.answer.text if answer.answer else None,
                        'is_correct': answer.is_correct
                    } for answer in student_answers]
                }
            })
        except Exception as e:
            print(f"Error getting test results: {str(e)}")  # Debug log
            return Response(
                {'error': f'Ошибка при получении результатов: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        try:
            test = self.get_object()
            answers_data = request.data.get('answers', [])
            
            # Create test attempt
            attempt = TestAttempt.objects.create(
                student=request.user,
                test=test,
                is_completed=True,
                completed_at=timezone.now()
            )

            # Get all questions for this test
            questions = list(test.questions.all())
            
            # Process each answer
            for question_index, answer_id in enumerate(answers_data):
                if question_index < len(questions):
                    question = questions[question_index]
                    
                    # Find the selected answer
                    selected_answer = Answer.objects.filter(
                        question=question,
                        id=answer_id
                    ).first()
                    
                    if selected_answer:
                        # Create student answer
                        StudentAnswer.objects.create(
                            attempt=attempt,
                            question=question,
                            answer=selected_answer,
                            is_correct=selected_answer.is_correct
                        )

            return Response({'message': 'Тест завершен'})
        except Exception as e:
            print(f"Error submitting test: {str(e)}")  # Debug log
            return Response(
                {'error': f'Ошибка при сохранении ответов: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

