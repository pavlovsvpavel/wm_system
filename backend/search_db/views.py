from rest_framework.request import Request
from django.shortcuts import get_object_or_404
from rest_framework import status, serializers
from rest_framework import generics as api_generic_views
from rest_framework.response import Response
from django.db import transaction

from upload_files.models import UploadedFile, UploadedFileRowData
from upload_files.serializers import UploadedFileRowDataSerializer

# class QRCodeSearchView(api_generic_views.GenericAPIView):
#     def post(self, request):
#         serial_number = request.data.get('qr_code')
#         file_id = request.data.get('file_id')
#         additional_data = {
#             'condition': request.data.get('condition_data'),
#             'scan_warehouse': request.data.get('scan_warehouse_data')
#         }
#
#         try:
#             uploaded_file = UploadedFile.objects.get(id=file_id)
#         except UploadedFile.DoesNotExist:
#             return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
#
#         row = UploadedFileRowData.objects.filter(file=uploaded_file, serial_number=serial_number).first()
#
#         if row:
#             # Update the additional data
#             row.condition = additional_data['condition']
#             row.scan_warehouse = additional_data['scan_warehouse']
#             row.save()
#             return Response({'message': 'Row updated successfully!'})
#         else:
#             # Add a new row if no match is found
#             new_row = UploadedFileRowData.objects.create(
#                 file=uploaded_file,
#                 serial_number=serial_number,
#                 condition=additional_data['condition'],
#                 scan_warehouse=additional_data['scan_warehouse'],
#             )
#             return Response({'message': 'New row added successfully!', 'row': UploadedFileRowDataSerializer(new_row).data})


ADDITIONAL_FIELDS = {
    'condition': 'condition_data',
    'scan_warehouse': 'scan_warehouse_data',
}


class QRCodeSearchSerializer(serializers.Serializer):
    qr_code = serializers.CharField(required=True)
    file_id = serializers.IntegerField(required=True)
    condition_data = serializers.CharField(required=False, allow_blank=True)
    scan_warehouse_data = serializers.CharField(required=False, allow_blank=True)


# class QRCodeSearchView(api_generic_views.GenericAPIView):
#     serializer_class = QRCodeSearchSerializer
#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#         serial_number = serializer.validated_data['qr_code']
#         file_id = serializer.validated_data['file_id']
#         additional_data = {
#             field: serializer.validated_data.get(data_key, '')
#             for field, data_key in ADDITIONAL_FIELDS.items()
#         }
#
#         try:
#             with transaction.atomic():
#                 uploaded_file = get_object_or_404(UploadedFile, id=file_id)
#                 row = UploadedFileRowData.objects.filter(file=uploaded_file, serial_number=serial_number).first()
#
#                 if row:
#                     for field, value in additional_data.items():
#                         setattr(row, field, value)
#                     row.save()
#                     return Response({
#                         'message': 'Row updated successfully!',
#                         'row': UploadedFileRowDataSerializer(row).data,
#                     })
#                 else:
#                     # Add a new row if no match is found
#                     new_row = UploadedFileRowData.objects.create(
#                         file=uploaded_file,
#                         serial_number=serial_number,
#                         **additional_data,
#                     )
#                     return Response({
#                         'message': 'New row added successfully!',
#                         'row': UploadedFileRowDataSerializer(new_row).data,
#                     })
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QRCodeSearchView(api_generic_views.RetrieveUpdateAPIView):
    serializer_class = QRCodeSearchSerializer

    def get_object(self):
        request: Request = self.request
        qr_code = request.data.get('qr_code')
        file_id = request.data.get('file_id')
        uploaded_file = get_object_or_404(UploadedFile, id=file_id)
        row = UploadedFileRowData.objects.filter(file=uploaded_file, serial_number=qr_code).first()
        return row

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        additional_data = {
            field: serializer.validated_data.get(data_key, '')
            for field, data_key in ADDITIONAL_FIELDS.items()
        }

        try:
            with transaction.atomic():
                if instance:
                    for field, value in additional_data.items():
                        setattr(instance, field, value)
                    instance.save()
                    return Response({
                        'message': 'Row updated successfully!',
                        'row': UploadedFileRowDataSerializer(instance).data,
                    })
                else:
                    # Add a new row if no match is found
                    new_row = UploadedFileRowData.objects.create(
                        file=get_object_or_404(UploadedFile, id=serializer.validated_data['file_id']),
                        serial_number=serializer.validated_data['qr_code'],
                        **additional_data,
                    )
                    return Response({
                        'message': 'New row added successfully!',
                        'row': UploadedFileRowDataSerializer(new_row).data,
                    })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)