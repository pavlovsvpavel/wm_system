from rest_framework import serializers

from upload_files.models import UploadedFileRowData, UploadedFile


class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFileRowData
        fields = '__all__'

    file = serializers.PrimaryKeyRelatedField(queryset=UploadedFile.objects.all(), required=False)