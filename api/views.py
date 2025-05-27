from django.shortcuts import render
from django.http import JsonResponse
# Create your views here.
def front(request):
    context = { }
    return render(request, "index.html", context)

