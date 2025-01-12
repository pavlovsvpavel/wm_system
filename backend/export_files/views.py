from django.utils import timezone
from django.http import HttpResponse
from rest_framework import status, permissions
from rest_framework import generics as api_generic_views
from rest_framework.response import Response

from export_files.models import UploadedFileRowDataResource
from upload_files.models import UploadedFile
from accounts.permissions import IsOwnerPermission
from upload_files.serializers import UploadedFileSerializer, UploadedFileRowDataSerializer


class ExportFileView(api_generic_views.GenericAPIView):
    serializer_class = UploadedFileSerializer
    serializer_class_row_data = UploadedFileRowDataSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get(self, request, pk):
        try:
            uploaded_file = self.serializer_class.Meta.model.objects.get(id=pk)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        rows = self.serializer_class_row_data.Meta.model.objects.filter(file=uploaded_file)

        if not rows.exists():
            return Response({'error': 'No data found for this file'}, status=status.HTTP_404_NOT_FOUND)

        # Use the resource class to export the data
        resource = UploadedFileRowDataResource()
        dataset = resource.export(rows)

        # Export to Excel
        response = HttpResponse(dataset.xlsx,
                                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        safe_file_name = 'Export_' + uploaded_file.__str__() + '_' + str(timezone.localdate().strftime('%d-%m-%Y')) + '.xlsx'

        response['Content-Disposition'] = f'attachment; filename="{safe_file_name}"'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'

        return response
