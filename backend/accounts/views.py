import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authtoken import views as token_views
from rest_framework import generics as api_generic_views, status, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError

from accounts.mixins import GetModelQuerySetMixin
from accounts.models import UserAccountTechnicalCondition, UserAccountWhsName
from accounts.permissions import IsAuthenticatedPermission
from accounts.serializers import UserRegisterSerializer, UserAccountTechnicalConditionSerializer, UserSerializer, \
    UserAccountWhsNameSerializer

UserModel = get_user_model()


class RegisterApiView(api_generic_views.CreateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        recaptcha_token = request.data.get('recaptcha_token')
        
        if not recaptcha_token:
            raise ValidationError(
                {'recaptcha_token': 'This field is required'},
                code=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify reCAPTCHA token with Google's API
        try:
            recaptcha_response = requests.post(
                'https://www.google.com/recaptcha/api/siteverify',
                data={
                    'secret': settings.RECAPTCHA_SECRET_KEY,
                    'response': recaptcha_token
                },
                timeout=5
            )
            recaptcha_response.raise_for_status()
            recaptcha_data = recaptcha_response.json()
            
            if not recaptcha_data.get('success'):
                raise ValidationError(
                    {'recaptcha_token': 'Invalid or expired reCAPTCHA token'},
                    code=status.HTTP_400_BAD_REQUEST
                )
                
            if recaptcha_data.get('score', 0) < 0.5:
                raise ValidationError(
                    {'recaptcha_token': 'reCAPTCHA verification failed (low score)'},
                    code=status.HTTP_400_BAD_REQUEST
                )
                
        except requests.exceptions.RequestException as e:
            raise ValidationError(
                {'recaptcha_token': 'Could not verify reCAPTCHA'},
                code=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Proceed with normal DRF create flow
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class LoginApiView(token_views.ObtainAuthToken):
    def verify_recaptcha(self, recaptcha_token):
        # Verify reCAPTCHA token with Google's API
        try:
            response = requests.post(
                'https://www.google.com/recaptcha/api/siteverify',
                data={
                    'secret': settings.RECAPTCHA_SECRET_KEY,
                    'response': recaptcha_token
                },
                timeout=3
            )
            response.raise_for_status()
            data = response.json()
            
            # Check if reCAPTCHA was successful and meets score threshold
            if not data.get('success') or data.get('score', 0) < 0.3:
                raise ValidationError(
                    {'recaptcha': 'Failed reCAPTCHA verification'},
                    code=status.HTTP_403_FORBIDDEN
                )
            return data
        except requests.RequestException as e:
            raise ValidationError(
                {'recaptcha': 'Could not verify reCAPTCHA'},
                code=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
    def post(self, request, *args, **kwargs):
        recaptcha_token = request.data.get('recaptcha_token')
        if not recaptcha_token:
            return Response(
                {'error': 'reCAPTCHA token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            self.verify_recaptcha(recaptcha_token)
        except ValidationError as e:
            return Response(
                e.detail,
                status=e.status_code
            )
        
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

class UserAccountTechnicalConditionView(GetModelQuerySetMixin, api_generic_views.RetrieveUpdateDestroyAPIView):
    serializer_class = UserAccountTechnicalConditionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthenticatedPermission]
    model = UserAccountTechnicalCondition

    def get(self, request, *args, **kwargs):
        conditions = self.get_queryset(request, self.model)
        serializer = self.serializer_class(conditions, many=True)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            warehouse = self.get_queryset(request, self.model).get(pk=kwargs["pk"])
            warehouse.delete()
            return Response({"detail": "Technical condition deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except UserAccountTechnicalCondition.DoesNotExist:
            return Response(
                {"detail": "Technical condition not found or you do not have permission to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )


class UserAccountWHSNameView(GetModelQuerySetMixin, api_generic_views.RetrieveUpdateDestroyAPIView):
    serializer_class = UserAccountWhsNameSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthenticatedPermission]
    model = UserAccountWhsName

    def get(self, request, *args, **kwargs):
        warehouses = self.get_queryset(request, self.model)
        serializer = self.serializer_class(warehouses, many=True)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            warehouse = self.get_queryset(request, self.model).get(pk=kwargs["pk"])
            warehouse.delete()
            return Response({"detail": "Warehouse deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except UserAccountWhsName.DoesNotExist:
            return Response(
                {"detail": "Warehouse not found or you do not have permission to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )
