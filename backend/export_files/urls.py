from django.urls import path

from export_files.views import ExportFileView

urlpatterns = [
    path('<int:pk>/', ExportFileView.as_view(), name='export-file'),
]
