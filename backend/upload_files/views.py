import warnings

import pandas as pd
from django.db import transaction
from rest_framework import generics as api_generic_views, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from upload_files.models import UploadedFile, UploadedFileRowData
from accounts.permissions import IsOwnerPermission
from upload_files.serializers import UploadedFileSerializer, ListUploadedFilesSerializer

# Suppress the warning for headers and footers
warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')

class UploadFileView(api_generic_views.CreateAPIView):
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    parser_classes = [MultiPartParser, FormParser]

    existing_file_names = queryset.values_list('name', flat=True)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')

        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.lower().endswith(('.xlsx', '.xls')):
            return Response({'error': 'Invalid file type. Only Excel files are allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        if file.name in self.existing_file_names :
            return Response({'error': 'File with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                uploaded_file = UploadedFile(name=file.name)

                try:
                    df = pd.read_excel(file)
                    df = df.fillna('')
                except Exception as e:
                    return Response({'error': f'Error reading Excel file: {e}'}, status=status.HTTP_400_BAD_REQUEST)

                # Get the actual columns from the DataFrame
                actual_columns = set(df.columns)

                #Now you can perform your checks based on actual_columns
                required_columns = {'POS SN', 'Outlet/WHS name', 'Scanned_Technical_condition', 'Scanned_WHS'}
                if not required_columns.issubset(actual_columns):
                    return Response({'error': f'Missing required columns: {required_columns - actual_columns}'}, status=status.HTTP_400_BAD_REQUEST)

                uploaded_file.save()

                row_objects = [
                    UploadedFileRowData(
                        file=uploaded_file,
                        pos_serial_number=str(row['POS SN']),
                        whs_outlet=str(row['WHS/Outlet']),
                        date_of_movement=str(row['Date of movement']),
                        outlet_whs_ext_code=str(row['Outlet/WHS Ext code']),
                        outlet_whs_name=str(row['Outlet/WHS name']),
                        outlet_whs_address=str(row['Outlet/WHS address']),
                        vat_id=str(row['VAT ID']),
                        network_name=str(row['Network name']),
                        gps_coordinates=str(row['GPS coordinates']),
                        outlet_category=str(row['Outlet Category']),
                        contract_exp_date=str(row['Contract exp date']),
                        contract_number=str(row['Contract #']),
                        pos_category=str(row['POS Category']),
                        pos_type=str(row['POS Type']),
                        pos_brand=str(row['POS Brand']),
                        pos_model=str(row['POS Model']),
                        pos_asset_number=str(row['POS Asset #']),
                        technical_condition=str(row['Technical condition']),
                        year_of_production=str(row['Year of production']),
                        remark=str(row['Remark']),
                        last_inv_date=str(row['Last Inv date']),
                        nm_name=str(row['NM name']),
                        rsm_name=str(row['RSM name']),
                        asm_name=str(row['ASM name']),
                        sr_code=str(row['SR code']),
                        sr_name=str(row['SR name']),
                        additional_comment=str(row['AdditionalComment']),
                        is_contract=str(row['Is contract (Sum)']),
                        is_protocol=str(row['Is protocol (Sum)']),
                        scanned_technical_condition=str(row['Scanned_Technical_condition']),
                        scanned_outlet_whs_name=str(row['Scanned_WHS']),
                    )
                    for _, row in df.iterrows()
                ]
                UploadedFileRowData.objects.bulk_create(row_objects)

            serializer = UploadedFileSerializer(uploaded_file)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


        except ValueError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': f"Unexpected error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ListUploadedFilesView(api_generic_views.ListAPIView):
    queryset = UploadedFile.objects.all()
    serializer_class = ListUploadedFilesSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get(self, request, *args, **kwargs):
        try:
            uploaded_files = self.get_queryset()

            if not uploaded_files.exists():
                return Response(
                    {'message': 'No files uploaded yet.'},
                    status=status.HTTP_204_NO_CONTENT  # Or any other status like 404
                )

            serializer = self.get_serializer(uploaded_files, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Failed to fetch files: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RetrieveLatestFileIdView(api_generic_views.RetrieveAPIView):
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get(self, request, *args, **kwargs):
        try:
            # Fetch the latest uploaded file id based on upload_date
            latest_file = UploadedFile.objects.order_by('-upload_date').first()

            if latest_file:
                latest_file_id = latest_file.id
                latest_file_name = latest_file.name
                # Check if the session has a current latest file id and if it is different
                current_file_id = request.session.get('latest_file_id')
                current_file_name = request.session.get('latest_file_name')

                if current_file_id != latest_file_id and current_file_name != latest_file_name:
                    # Update the session with the new latest file id
                    request.session['latest_file_id'] = latest_file_id
                    request.session['latest_file_name'] = latest_file_name
                    return Response({
                        'message': 'New latest file found, session updated.',
                        'latest_file_id': latest_file_id,
                        'latest_file_name': latest_file_name,
                    }, status=status.HTTP_200_OK)
                else:
                    # If the latest file in the database is the same as the one in the session
                    return Response({
                        'message': 'No new latest file, session remains the same.',
                        'latest_file_id': current_file_id,
                        'latest_file_name': current_file_name,
                    }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'message': 'No files uploaded yet.'},
                    status=status.HTTP_204_NO_CONTENT
                )

        except Exception as e:
            return Response({'error': f"Failed to fetch the latest file id: {e}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
