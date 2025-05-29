from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Student, Test, Question, Answer, TestAttempt, StudentAnswer, Article, ArticleImage

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ('id', 'username', 'full_name', 'role')
        read_only_fields = ('id',)

class StudentCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Student
        fields = ('username', 'password', 'password2', 'full_name', 'role')

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

    class Meta:
        model = Test
        fields = ('id', 'title', 'description', 'creator', 'test_type', 
                 'created_at', 'updated_at', 'is_published', 'time_limit', 'questions')
        read_only_fields = ('creator', 'created_at', 'updated_at')

    def create(self, validated_data):
        # Get questions data from the request data
        questions_data = self.context.get('request').data.get('questions', [])
        
        # Create test without questions
        test = Test.objects.create(**validated_data)
        
        # Create and add questions with their answers
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
        
        # Set questions using the proper method
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

class ArticleImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ArticleImage
        fields = ('id', 'image', 'image_url', 'caption', 'order')

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class ArticleSerializer(serializers.ModelSerializer):
    creator = StudentSerializer(read_only=True)
    images = ArticleImageSerializer(many=True, read_only=True)
    featured_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ('id', 'title', 'content', 'creator', 'created_at', 'updated_at', 
                 'is_published', 'featured_image', 'featured_image_url', 'images')
        read_only_fields = ('creator', 'created_at', 'updated_at')

    def get_featured_image_url(self, obj):
        if obj.featured_image:
            return self.context['request'].build_absolute_uri(obj.featured_image.url)
        return None

    def create(self, validated_data):
        images_data = self.context.get('images', [])
        article = Article.objects.create(**validated_data)
        
        for image_data in images_data:
            ArticleImage.objects.create(article=article, **image_data)
        
        return article

    def update(self, instance, validated_data):
        images_data = self.context.get('images', [])
        
        # Update article fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update images if provided
        if images_data:
            instance.images.all().delete()
            for image_data in images_data:
                ArticleImage.objects.create(article=instance, **image_data)
        
        return instance 