from django.contrib.auth import get_user_model
from rest_framework.authtoken import views as token_views
from rest_framework import generics as api_generic_views, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from accounts.serializers import UserRegisterSerializer

UserModel = get_user_model()


class RegisterApiView(api_generic_views.CreateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserRegisterSerializer


class LoginApiView(token_views.ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

# No need. Handled on client-side (React, Android ...)
# class LogoutApiView(api_generic_views.GenericAPIView):
#     pass
