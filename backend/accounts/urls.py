from django.urls import path

from accounts.views import LoginApiView, RegisterApiView

urlpatterns = [
    path("login/", LoginApiView.as_view(), name="login_user"),
    path("register/", RegisterApiView.as_view(), name="register_user"),
]
