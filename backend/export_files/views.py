from django.utils import timezone
from django.http import HttpResponse
from rest_framework import status, permissions
from rest_framework import generics as api_generic_views
from rest_framework.response import Response

from export_files.models import UploadedFileRowDataResource
from upload_files.models import UploadedFileRowData
from accounts.permissions import IsAuthenticatedPermission


class ExportFileView(api_generic_views.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAuthenticatedPermission]

    def get(self, request, pk):
        try:
            rows = (
                UploadedFileRowData.objects
                .filter(file__id=pk)
                .select_related('file', 'user', )
            )

            if not rows.exists():
                return Response({'error': 'No data found for this file'},
                                status=status.HTTP_404_NOT_FOUND)

            uploaded_file = rows[0].file

            resource = UploadedFileRowDataResource()
            dataset = resource.export(rows)

            # Export to Excel
            response = HttpResponse(
                dataset.xlsx,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            safe_file_name = f'Export_{uploaded_file.name}_{timezone.localdate().strftime("%d-%m-%Y")}.xlsx'
            response['Content-Disposition'] = f'attachment; filename="{safe_file_name}"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'

            return response

        except Exception as e:
            return Response({'error': f'Failed to export file: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
