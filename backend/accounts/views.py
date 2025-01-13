from django.contrib.auth import get_user_model
from rest_framework.authtoken import views as token_views
from rest_framework import generics as api_generic_views, status, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from accounts.models import UserAccountTechnicalCondition, UserAccountWhsName
from accounts.permissions import IsOwnerPermission
from accounts.serializers import UserRegisterSerializer, UserAccountTechnicalConditionSerializer, UserSerializer, \
    UserAccountWhsNameSerializer

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

        user_serializer = UserSerializer(user)

        return Response({
            'token': token.key,
            'user': user_serializer.data
        })


# No need. Handled on client-side (React, Android ...)
# class LogoutApiView(api_generic_views.GenericAPIView):
#     pass

class UserAccountTechnicalConditionView(api_generic_views.RetrieveUpdateDestroyAPIView):
    queryset = UserAccountTechnicalCondition.objects.all()
    serializer_class = UserAccountTechnicalConditionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get(self, request, *args, **kwargs):
        conditions = UserAccountTechnicalCondition.objects.all()
        serializer = self.serializer_class(conditions, many=True)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            warehouse = self.get_queryset().get(pk=kwargs["pk"])
            warehouse.delete()
            return Response({"detail": "Technical condition deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except UserAccountTechnicalCondition.DoesNotExist:
            return Response(
                {"detail": "Technical condition not found or you do not have permission to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )


class UserAccountWHSNameView(api_generic_views.RetrieveUpdateDestroyAPIView):
    queryset = UserAccountWhsName.objects.all()
    serializer_class = UserAccountWhsNameSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get(self, request, *args, **kwargs):
        warehouses = self.get_queryset()
        serializer = self.serializer_class(warehouses, many=True)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            warehouse = self.get_queryset().get(pk=kwargs["pk"])
            warehouse.delete()
            return Response({"detail": "Warehouse deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except UserAccountWhsName.DoesNotExist:
            return Response(
                {"detail": "Warehouse not found or you do not have permission to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )
