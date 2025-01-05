from django.urls import path

from search_db.views import QRCodeSearchView

urlpatterns = [
    path('', QRCodeSearchView.as_view(), name='search_db'),
]
