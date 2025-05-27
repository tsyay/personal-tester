from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from api.views import front

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', front, name='front'),
]