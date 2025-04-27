from rest_framework.request import Request
from rest_framework import status, permissions, serializers
from rest_framework import generics as api_generic_views
from rest_framework.response import Response
from django.db import transaction

from accounts.permissions import IsAuthenticatedPermission
from search_db.serializers import QRCodeSerializer
from upload_files.models import UploadedFileRowData
from upload_files.serializers import UploadedFileRowDataSerializer


class QRCodeSearchView(api_generic_views.ListAPIView):
    serializer_class = QRCodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthenticatedPermission]

    def get_queryset(self):
        request: Request = self.request
        scanned_pos_serial_number = request.query_params.get('scanned_pos_serial_number')
        latest_file_id = request.query_params.get('latest_file_id')

        if not latest_file_id:
            latest_file_id = request.session.get('latest_file_id')

        if not latest_file_id:
            return UploadedFileRowData.objects.none()

        return UploadedFileRowData.objects.filter(
            file_id=latest_file_id,
            pos_serial_number__icontains=scanned_pos_serial_number,
        ).order_by('pos_serial_number')


class QRCodeUpdateView(api_generic_views.UpdateAPIView):
    serializer_class = QRCodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthenticatedPermission]

    def update(self, request, *args, **kwargs):
        latest_file_id = request.session.get('latest_file_id') or request.data.get('latest_file_id')
        user = request.user

        if not latest_file_id:
            return Response({'error': 'No file ID found in session. Cannot proceed with update.'},
                            status=status.HTTP_400_BAD_REQUEST)

        pos_serial_number = request.data.get('pos_serial_number')
        if not pos_serial_number:
            return Response({'error': 'No scanned POS serial number provided.'},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data, context={'user': user})

        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            return Response({'error': 'Validation failed', 'details': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                updated_count = UploadedFileRowData.objects.filter(
                    file_id=latest_file_id,
                    pos_serial_number=serializer.validated_data['pos_serial_number']
                ).update(
                    scanned_technical_condition=serializer.validated_data.get('scanned_technical_condition', ''),
                    scanned_outlet_whs_name=serializer.validated_data.get('scanned_outlet_whs_name', ''),
                    user=user
                )

                if updated_count > 0:
                    return Response({
                        'message': 'Record updated successfully!',
                        'scanned_pos_serial_number': pos_serial_number,
                        'file_id': latest_file_id,
                        'scanned_technical_condition': serializer.validated_data.get('scanned_technical_condition', ''),
                        'scanned_outlet_whs_name': serializer.validated_data.get('scanned_outlet_whs_name', ''),
                    }, status=status.HTTP_200_OK)

                new_row = UploadedFileRowData.objects.create(
                    file_id=latest_file_id,
                    pos_serial_number=pos_serial_number,
                    scanned_technical_condition=serializer.validated_data.get('scanned_technical_condition', ''),
                    scanned_outlet_whs_name=serializer.validated_data.get('scanned_outlet_whs_name', ''),
                    user=user,
                )
                return Response({
                    'message': 'New record added successfully!',
                    'row': UploadedFileRowDataSerializer(new_row).data,
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
