from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import Test, Question, Answer, TestAttempt, StudentAnswer, Student, Article, ArticlePage, ArticleProgress, Course, Position
from .serializers import (
    StudentSerializer, StudentCreateSerializer, LoginSerializer,
    TestSerializer, QuestionSerializer, AnswerSerializer,
    TestAttemptSerializer, StudentAnswerSerializer,
    ArticleSerializer, ArticleCreateSerializer, ArticlePageSerializer, ArticleProgressSerializer,
    CourseSerializer, PositionSerializer
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
    def change_position(self, request):
        user = request.user
        if not user.check_password(request.data.get('password')):
            return Response({'error': 'Неверный пароль'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_position = request.data.get('position')
        if new_position not in ['Официант', 'Бармен', 'Менеджер', 'Уборщик', 'Повар']:
            return Response({'error': 'Неверная должность'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.position = new_position
        user.save()
        return Response(self.get_serializer(user).data)

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

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login_refresh(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Position.objects.all()

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
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
        if self.request.user.role not in ['TEACHER', 'ADMIN']:
            raise permissions.PermissionDenied('Только преподаватели и администраторы могут создавать тесты')
        serializer.save(creator=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут создавать тесты'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут редактировать тесты'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут удалять тесты'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

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
            student_answers = StudentAnswer.objects.filter(attempt=attempt).select_related('question', 'selected_answer')
            
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
                        'selected_answer': answer.selected_answer.text if answer.selected_answer else answer.text_answer,
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
            student = request.user  # Student is the user model
            
            # Create test attempt
            attempt = TestAttempt.objects.create(
                student=student,
                test=test,
                started_at=timezone.now(),
                is_completed=True,
                completed_at=timezone.now()
            )
            
            # Process answers
            answers = request.data.get('answers', [])
            for question, answer in zip(test.questions.all(), answers):
                if question.question_type == 'TEXT_INPUT':
                    # For text input, create a new answer with the student's response
                    student_answer = StudentAnswer.objects.create(
                        attempt=attempt,
                        question=question,
                        text_answer=answer  # Store the text response
                    )
                else:
                    # For multiple choice, find the selected answer
                    selected_answer = question.answers.filter(id=answer).first()
                    if selected_answer:
                        StudentAnswer.objects.create(
                            attempt=attempt,
                            question=question,
                            selected_answer=selected_answer
                        )
            
            return Response({'message': 'Test submitted successfully'})
        except Exception as e:
            print(f"Error in submit: {str(e)}")  # Debug log
            return Response(
                {'error': str(e)},
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
        if user.role in ['TEACHER', 'ADMIN']:
            return Article.objects.prefetch_related('positions').all()
        return Article.objects.filter(
            is_published=True
        ).prefetch_related('positions').distinct()

    def get_serializer_class(self):
        if self.action == 'create':
            return ArticleCreateSerializer
        return ArticleSerializer

    def perform_create(self, serializer):
        if self.request.user.role not in ['TEACHER', 'ADMIN']:
            raise permissions.PermissionDenied('Только преподаватели и администраторы могут создавать статьи')
        serializer.save(creator=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут создавать статьи'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут редактировать статьи'},
                status=status.HTTP_403_FORBIDDEN
            )
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут удалять статьи'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        logger.info(f"Retrieving article with ID: {kwargs.get('pk')}")
        try:
            # Проверяем, что pk существует и является числом
            pk = kwargs.get('pk')
            if not pk:
                logger.error("No pk provided in kwargs")
                return Response({'error': 'ID статьи не указан'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                pk = int(pk)
            except (TypeError, ValueError):
                logger.error(f"Invalid pk format: {pk}")
                return Response({'error': 'Неверный формат ID статьи'}, status=status.HTTP_400_BAD_REQUEST)

            # Получаем статью
            try:
                instance = self.get_object()
                logger.info(f"Article found: {instance is not None}")
                if instance:
                    logger.info(f"Article details - ID: {instance.id}, Creator: {instance.creator.id}, Published: {instance.is_published}")
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
            except Article.DoesNotExist:
                logger.error(f"Article with ID {pk} does not exist")
                return Response({'error': 'Статья не найдена'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving article: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def page(self, request, pk=None):
        article = self.get_object()
        page_number = request.query_params.get('page', 1)
        try:
            page = article.pages.get(page_number=page_number)
            return Response(ArticlePageSerializer(page).data)
        except ArticlePage.DoesNotExist:
            return Response({'error': 'Page not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        article = self.get_object()
        page_number = request.data.get('page_number', 1)
        
        # Get or create progress
        progress, created = ArticleProgress.objects.get_or_create(
            student=request.user,
            article=article,
            defaults={'current_page': page_number}
        )
        
        if not created:
            progress.current_page = page_number
            # Mark as completed if it's the last page
            if page_number >= article.total_pages:
                progress.is_completed = True
            progress.save()
        
        return Response(ArticleProgressSerializer(progress).data)

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
        page_number = request.data.get('page_number', 1)
        
        try:
            page = article.pages.get(page_number=page_number)
            if 'image' not in request.FILES:
                return Response({'error': 'No image provided'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            page.image = request.FILES['image']
            page.save()
            return Response(ArticlePageSerializer(page, context={'request': request}).data)
        except ArticlePage.DoesNotExist:
            return Response({'error': 'Page not found'}, 
                          status=status.HTTP_404_NOT_FOUND)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['TEACHER', 'ADMIN']:
            return Course.objects.prefetch_related('articles', 'tests', 'positions').all()
        return Course.objects.prefetch_related('articles', 'tests', 'positions').all()

    def perform_create(self, serializer):
        if self.request.user.role not in ['TEACHER', 'ADMIN']:
            raise permissions.PermissionDenied('Только преподаватели и администраторы могут создавать курсы')
        serializer.save()

    def update(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут редактировать курсы'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут удалять курсы'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def add_article(self, request, pk=None):
        course = self.get_object()
        article_id = request.data.get('article_id')
        try:
            article = Article.objects.get(id=article_id)
            course.articles.add(article)
            return Response(self.get_serializer(course).data)
        except Article.DoesNotExist:
            return Response({'error': 'Статья не найдена'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def add_test(self, request, pk=None):
        course = self.get_object()
        test_id = request.data.get('test_id')
        try:
            test = Test.objects.get(id=test_id)
            course.tests.add(test)
            return Response(self.get_serializer(course).data)
        except Test.DoesNotExist:
            return Response({'error': 'Тест не найден'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_article(self, request, pk=None):
        course = self.get_object()
        article_id = request.data.get('article_id')
        try:
            article = Article.objects.get(id=article_id)
            course.articles.remove(article)
            return Response(self.get_serializer(course).data)
        except Article.DoesNotExist:
            return Response({'error': 'Статья не найдена'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_test(self, request, pk=None):
        course = self.get_object()
        test_id = request.data.get('test_id')
        try:
            test = Test.objects.get(id=test_id)
            course.tests.remove(test)
            return Response(self.get_serializer(course).data)
        except Test.DoesNotExist:
            return Response({'error': 'Тест не найден'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def add_position(self, request, pk=None):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут управлять должностями курса'},
                status=status.HTTP_403_FORBIDDEN
            )
        course = self.get_object()
        position_id = request.data.get('position_id')
        try:
            position = Position.objects.get(id=position_id)
            course.positions.add(position)
            return Response(self.get_serializer(course).data)
        except Position.DoesNotExist:
            return Response({'error': 'Должность не найдена'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_position(self, request, pk=None):
        if request.user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Только преподаватели и администраторы могут управлять должностями курса'},
                status=status.HTTP_403_FORBIDDEN
            )
        course = self.get_object()
        position_id = request.data.get('position_id')
        try:
            position = Position.objects.get(id=position_id)
            course.positions.remove(position)
            return Response(self.get_serializer(course).data)
        except Position.DoesNotExist:
            return Response({'error': 'Должность не найдена'}, status=status.HTTP_404_NOT_FOUND)

