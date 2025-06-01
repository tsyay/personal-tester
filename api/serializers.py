from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Student, Test, Question, Answer, TestAttempt, StudentAnswer, Article, ArticlePage, ArticleProgress, Course, Position

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name', 'description']

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ('id', 'username', 'full_name', 'role', 'position')
        read_only_fields = ('id',)

class StudentCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    position = serializers.CharField(default='WAITER', required=False)

    class Meta:
        model = Student
        fields = ('username', 'password', 'password2', 'full_name', 'role', 'position')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = Student.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('id', 'text', 'is_correct', 'order')

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, required=False)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'text', 'image', 'image_url', 'order', 'points', 'question_type', 'answers')

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class StudentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ('id', 'question', 'answer', 'text_answer', 'is_correct', 'answered_at')
        read_only_fields = ('is_correct', 'answered_at')

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    creator = StudentSerializer(read_only=True)
    positions = PositionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ('id', 'title', 'description', 'creator', 'test_type', 
                 'created_at', 'updated_at', 'is_published', 'time_limit', 'questions', 'positions')
        read_only_fields = ('creator', 'created_at', 'updated_at')

    def create(self, validated_data):
        positions_data = self.context.get('request').data.get('positions', [])
        questions_data = self.context.get('request').data.get('questions', [])
        
        test = Test.objects.create(**validated_data)
        
        # Add positions
        for position_id in positions_data:
            try:
                position = Position.objects.get(id=position_id)
                test.positions.add(position)
            except Position.DoesNotExist:
                pass
        
        # Create and add questions with their answers
        questions = []
        for question_data in questions_data:
            question = Question.objects.create(
                text=question_data.get('text'),
                question_type=question_data.get('question_type', 'MULTIPLE_CHOICE'),
                points=question_data.get('points', 1)
            )
            
            answers_data = question_data.get('answers', [])
            for answer_data in answers_data:
                Answer.objects.create(
                    question=question,
                    text=answer_data.get('text'),
                    is_correct=answer_data.get('is_correct', False)
                )
            
            questions.append(question)
        
        test.questions.set(questions)
        return test

    def update(self, instance, validated_data):
        # Get questions data from the request data
        questions_data = self.context.get('request').data.get('questions', [])
        
        # Update test fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update questions if provided
        if questions_data:
            # Delete existing questions and their answers
            for question in instance.questions.all():
                question.answers.all().delete()
            instance.questions.all().delete()
            
            # Create new questions with their answers
            questions = []
            for question_data in questions_data:
                # Create question
                question = Question.objects.create(
                    text=question_data.get('text'),
                    question_type=question_data.get('question_type', 'MULTIPLE_CHOICE'),
                    points=question_data.get('points', 1)
                )
                
                # Create answers for the question
                answers_data = question_data.get('answers', [])
                for answer_data in answers_data:
                    Answer.objects.create(
                        question=question,
                        text=answer_data.get('text'),
                        is_correct=answer_data.get('is_correct', False)
                    )
                
                questions.append(question)
            
            instance.questions.set(questions)
        
        return instance

class TestAttemptSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    test = TestSerializer(read_only=True)
    answers = StudentAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = TestAttempt
        fields = ('id', 'student', 'test', 'started_at', 'completed_at', 
                 'score', 'is_completed', 'answers')
        read_only_fields = ('student', 'started_at', 'completed_at', 'score', 'answers')

class ArticlePageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ArticlePage
        fields = ['id', 'title', 'content', 'page_number', 'image', 'image_url', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class ArticleSerializer(serializers.ModelSerializer):
    pages = ArticlePageSerializer(many=True, read_only=True)
    creator = StudentSerializer(read_only=True)
    progress = serializers.SerializerMethodField()
    positions = PositionSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'description', 'creator', 'created_at', 'updated_at', 
                 'is_published', 'featured_image', 'total_pages', 'pages', 'progress', 'positions']

    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = ArticleProgress.objects.filter(
                student=request.user,
                article=obj
            ).first()
            if progress:
                return {
                    'current_page': progress.current_page,
                    'progress_percentage': progress.progress_percentage,
                    'is_completed': progress.is_completed
                }
        return None

class ArticleCreateSerializer(serializers.ModelSerializer):
    pages = ArticlePageSerializer(many=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'description', 'is_published', 'featured_image', 'total_pages', 'pages']

    def create(self, validated_data):
        pages_data = validated_data.pop('pages')
        article = Article.objects.create(**validated_data)
        
        for page_data in pages_data:
            ArticlePage.objects.create(article=article, **page_data)
        
        return article

class ArticleProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleProgress
        fields = ['current_page', 'progress_percentage', 'is_completed', 'last_read_at'] 

class CourseSerializer(serializers.ModelSerializer):
    articles = serializers.SerializerMethodField()
    tests = serializers.SerializerMethodField()
    positions = PositionSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'articles', 'tests', 'positions', 'created_at', 'updated_at']
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
            'is_published': test.is_published,
            'created_at': test.created_at
        } for test in tests] 