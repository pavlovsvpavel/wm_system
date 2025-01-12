from django.urls import path

from search_db.views import QRCodeSearchView, QRCodeUpdateView

urlpatterns = [
    path('search/', QRCodeSearchView.as_view(), name='search_db'),
    path('update/', QRCodeUpdateView.as_view(), name='update_db'),
]
