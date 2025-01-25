from rest_framework import serializers
from routing.models import RoutingUploadedFileData


class RoutingUploadedFileDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutingUploadedFileData
        fields = '__all__'
