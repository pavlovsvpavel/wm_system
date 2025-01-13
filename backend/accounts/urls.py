from django.urls import path

from accounts.views import LoginApiView, RegisterApiView, UserAccountTechnicalConditionView, UserAccountWHSNameView

urlpatterns = [
    path("login/", LoginApiView.as_view(), name="login_user"),
    path("register/", RegisterApiView.as_view(), name="register_user"),
    path("user/technical-conditions/", UserAccountTechnicalConditionView.as_view(), name="technical_conditions"),
    path("user/technical-conditions/<int:pk>/", UserAccountTechnicalConditionView.as_view(), name="technical_conditions_delete"),
    path("user/whs-names/", UserAccountWHSNameView.as_view(), name="whs_names"),
    path("user/whs-names/<int:pk>/", UserAccountWHSNameView.as_view(), name="whs_names_delete"),
]
