from rest_framework import serializers

from accounts.models import UserAccount
from upload_files.models import UploadedFileRowData, UploadedFile


class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFileRowData
        fields = '__all__'

    file = serializers.PrimaryKeyRelatedField(queryset=UploadedFile.objects.all(), required=False)
    user = serializers.PrimaryKeyRelatedField(queryset=UserAccount.objects.all(), required=False)
