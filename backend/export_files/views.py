from django.utils import timezone
from django.http import HttpResponse
from rest_framework import status
from rest_framework import generics as api_generic_views
from rest_framework.response import Response

from export_files.models import UploadedFileRowDataResource
from upload_files.models import UploadedFile, UploadedFileRowData
from upload_files.serializers import UploadedFileSerializer, UploadedFileRowDataSerializer


class ExportFileView(api_generic_views.GenericAPIView):
    serializer_class = UploadedFileSerializer
    serializer_class_row_data = UploadedFileRowDataSerializer

    def get(self, request, pk):
        try:
            # uploaded_file = UploadedFile.objects.get(id=pk)
            uploaded_file = self.serializer_class.Meta.model.objects.get(id=pk)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch related rows
        # rows = UploadedFileRowData.objects.filter(file=uploaded_file)
        rows = self.serializer_class_row_data.Meta.model.objects.filter(file=uploaded_file)

        if not rows.exists():
            return Response({'error': 'No data found for this file'}, status=status.HTTP_404_NOT_FOUND)

        # Use the resource class to export the data
        resource = UploadedFileRowDataResource()
        dataset = resource.export(rows)

        # Export to Excel
        response = HttpResponse(dataset.xlsx,
                                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        safe_file_name = uploaded_file.__str__() + '_export_' + str(timezone.localdate().strftime('%d-%m-%Y'))
        response['Content-Disposition'] = f'attachment; filename="{safe_file_name}"'

        return response
