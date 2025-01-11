from django.contrib.auth import get_user_model
from rest_framework import serializers

UserModel = get_user_model()


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