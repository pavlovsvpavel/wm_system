from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import UserAccountTechnicalCondition, UserAccountWhsName

UserModel = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['id', 'username']


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('username', 'password')
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_username(self, value):
        """
        Check if the username is already taken and raise a validation error if it is.
        """
        if UserModel.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken. Please choose a different username.")
        return value

    def create(self, validated_data):
        return UserModel.objects.create_user(**validated_data)


class UserAccountTechnicalConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccountTechnicalCondition
        fields = ['id', 'technical_condition']

    def create(self, validated_data):
        return UserAccountTechnicalCondition.objects.create(**validated_data)


class UserAccountWhsNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccountWhsName
        fields = ['id', 'whs_name']

    def create(self, validated_data):
        return UserAccountWhsName.objects.create(**validated_data)
