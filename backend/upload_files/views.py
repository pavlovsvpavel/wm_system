import pandas as pd
from django.db import transaction
from django.http import Http404
from rest_framework import generics as api_generic_views, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from upload_files.models import UploadedFile, UploadedFileRowData
from upload_files.permissions import IsOwnerPermission
from upload_files.serializers import UploadedFileSerializer


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
                required_columns = {'SERIALNUMBER', 'WAREHOUSE', 'CONDITION', 'SCANWAREHOUSE'}
                if not required_columns.issubset(actual_columns):
                    return Response({'error': f'Missing required columns: {required_columns - actual_columns}'}, status=status.HTTP_400_BAD_REQUEST)

                uploaded_file.save()

                row_objects = [
                    UploadedFileRowData(
                        file=uploaded_file,
                        serial_number=str(row['SERIALNUMBER']),
                        item_name=str(row['ITEMNAME']),
                        account_key=str(row['ACCOUNTKEY']),
                        account_name=str(row['ACCOUNTNAME']),
                        account_address=str(row['ADRESA_POS']),
                        account_bulstat=str(row['TAXFILENUM']),
                        account_type=str(row['PROFILE6']),
                        asset_model=str(row['ASSETMODEL']),
                        warehouse=str(row['WAREHOUSE']),
                        agent=str(row['AGENT']),
                        agent_name=str(row['NAME']),
                        asset_type=str(row['SORTCODENAME']),
                        condition=str(row['CONDITION']),
                        scan_warehouse=str(row['SCANWAREHOUSE']),
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



class UploadedFilesView(api_generic_views.ListAPIView):
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get(self, request, *args, **kwargs):
        try:
            # Fetch all files and serialize them
            uploaded_files = self.get_queryset()
            serializer = self.get_serializer(uploaded_files, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Failed to fetch files: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LatestUploadedFileView(api_generic_views.RetrieveAPIView):
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]

    def get_object(self):
        # Fetch the latest uploaded file based on upload_date
        latest_file = UploadedFile.objects.order_by('-upload_date').first()
        if not latest_file:
            raise Http404("No files found.")
        return latest_file

    def get(self, request, *args, **kwargs):
        try:
            latest_file = self.get_object()
            serializer = self.get_serializer(latest_file)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Failed to fetch the latest file: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
