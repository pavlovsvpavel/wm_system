from django.urls import path

from upload_files.views import UploadFileView, UploadedFilesView, LatestUploadedFileView

urlpatterns = [
    path('file/', UploadFileView.as_view(), name='upload-file'),
    path('get-files/', UploadedFilesView.as_view(), name='get-files'),
    path('latest-file/', LatestUploadedFileView.as_view(), name='latest-file'),
]
