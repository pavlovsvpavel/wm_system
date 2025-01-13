from rest_framework.exceptions import NotFound
from rest_framework.request import Request
from rest_framework import status, permissions, serializers
from rest_framework import generics as api_generic_views
from rest_framework.response import Response
from django.db import transaction

from accounts.permissions import IsOwnerPermission
from search_db.serializers import QRCodeSerializer
from upload_files.models import UploadedFile, UploadedFileRowData
from upload_files.serializers import UploadedFileRowDataSerializer


class QRCodeSearchView(api_generic_views.RetrieveAPIView):
    serializer_class = QRCodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get_object(self):
        request: Request = self.request
        scanned_pos_serial_number = request.query_params.get('scanned_pos_serial_number')
        latest_file_id = request.query_params.get('latest_file_id')

        if not latest_file_id:
            latest_file_id = request.session.get('latest_file_id')

        if not latest_file_id:
            return Response({'error': 'No latest file ID found in session or request.'},
                            status=status.HTTP_400_BAD_REQUEST)

        row = (UploadedFileRowData.objects.filter(
            file_id=latest_file_id,
            pos_serial_number=scanned_pos_serial_number
        ).first())

        return row

class QRCodeUpdateView(api_generic_views.UpdateAPIView):
    serializer_class = QRCodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def update(self, request, *args, **kwargs):
        latest_file_id = request.session.get('latest_file_id') or request.data.get('latest_file_id')
        user = request.user

        if not latest_file_id:
            return Response({'error': 'No file ID found in session. Cannot proceed with update.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the scanned POS serial number from the request data
        pos_serial_number = request.data.get('pos_serial_number')

        if not pos_serial_number:
            return Response({'error': 'No scanned POS serial number provided.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the file using the latest_file_id from the session
        try:
            uploaded_file = UploadedFile.objects.only('id').get(id=latest_file_id)
        except UploadedFile.DoesNotExist:
            raise NotFound(detail="Uploaded file with the latest file ID not found.")

        serializer = self.get_serializer(data=request.data, context={'user': user})

        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            print(f"Validation error: {e}")
            return Response({'error': 'Validation failed', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                row_instance = UploadedFileRowData.objects.filter(
                    file_id=uploaded_file.id,
                    pos_serial_number=serializer.validated_data['pos_serial_number'],
                ).first()

                if row_instance:
                    row_instance.scanned_technical_condition = serializer.validated_data.get(
                        'scanned_technical_condition', '')
                    row_instance.scanned_outlet_whs_name = serializer.validated_data.get('scanned_outlet_whs_name', '')
                    row_instance.save()

                    return Response({
                        'message': 'Row updated successfully!',
                        'scanned_pos_serial_number': serializer.validated_data['pos_serial_number'],
                        'file_id': uploaded_file.id,
                        'scanned_technical_condition': serializer.validated_data.get('scanned_technical_condition', ''),
                        'scanned_outlet_whs_name': serializer.validated_data.get('scanned_outlet_whs_name', ''),
                    }, status=status.HTTP_200_OK)

                new_row = UploadedFileRowData.objects.create(
                    file_id=uploaded_file.id,
                    pos_serial_number=serializer.validated_data['pos_serial_number'],
                    scanned_technical_condition=serializer.validated_data.get('scanned_technical_condition', ''),
                    scanned_outlet_whs_name=serializer.validated_data.get('scanned_outlet_whs_name', ''),
                    user=user,
                )
                return Response({
                    'message': 'New row added successfully!',
                    'row': UploadedFileRowDataSerializer(new_row).data,
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
