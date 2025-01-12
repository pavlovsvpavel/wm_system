from django.urls import path

from upload_files.views import UploadFileView, RetrieveLatestFileIdView, ListUploadedFilesView

urlpatterns = [
    path('upload-file/', UploadFileView.as_view(), name='upload-file'),
    path('get-files/', ListUploadedFilesView.as_view(), name='get-files'),
    path('latest-file/', RetrieveLatestFileIdView.as_view(), name='latest-file'),
]
