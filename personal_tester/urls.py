from django.contrib import admin
from django.urls import path
from api.views import front
urlpatterns = [
    path('admin/', admin.site.urls),
    path("", front, name="front"),
]