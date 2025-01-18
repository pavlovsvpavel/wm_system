from rest_framework import serializers

from upload_files.models import UploadedFileRowData, UploadedFile


class UploadedFileRowDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFileRowData
        fields = '__all__'

class UploadedFileSerializer(serializers.ModelSerializer):
    rows = UploadedFileRowDataSerializer(many=True, read_only=True)

    class Meta:
        model = UploadedFile
        fields = ['id', 'name', 'upload_date', 'rows', 'user']


class ListUploadedFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'name']
