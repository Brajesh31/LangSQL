from django.urls import path
from .views import GenerateSQLView

urlpatterns = [
    path('generate-sql/', GenerateSQLView.as_view(), name='generate-sql'),
]