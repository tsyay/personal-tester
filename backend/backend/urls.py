from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import StudentViewSet, TestViewSet, ArticleViewSet, front
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'tests', TestViewSet, basename='test')
router.register(r'articles', ArticleViewSet, basename='article')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', front, name='front'),
] 