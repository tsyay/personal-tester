from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, TestViewSet, ArticleViewSet, CourseViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'tests', TestViewSet)
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'courses', CourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 