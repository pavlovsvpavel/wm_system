import pandas as pd
from django.db import transaction
from rest_framework import generics as api_generic_views
from rest_framework.response import Response
from rest_framework import status

from routing.models import RoutingUploadedFileData
from routing.serializers import RoutingUploadedFileDataSerializer

class RoutingUploadedFileDataView(api_generic_views.CreateAPIView):
    serializer_class = RoutingUploadedFileDataSerializer
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')

        if not file or not file.name.endswith('.xlsx'):
            return Response({"error": "Please upload a valid .xlsx file."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                try:
                    df = pd.read_excel(file)
                    df = df.fillna('')

                    for index, row in df.iterrows():
                        RoutingUploadedFileData.objects.create(
                            type_of_route=row['Type of route'],
                            sr_name=row['Organizational Structure Object'],
                            region=row['Geography Object'],
                            company_name=row[' Legal Name of an Outlet'],
                            outlet_name=row['Actual Name of an Outlet'],
                            delivery_address=row['Delivery Address'],
                            pos_model=row['POS Equipment'],
                            pos_serial_number=row['Serial Number'],
                            comment=row['Comment'],
                            transport_company=row['Additional Comment'],
                            date_for_delivery=row['Fact Delivery Date'],
                            user=request.user
                        )

                    return Response({"message": "Data uploaded successfully."}, status=status.HTTP_201_CREATED)

                except Exception as e:
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': f"Unexpected error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class RoutingRetrieveDataView(api_generic_views.RetrieveAPIView):
    serializer_class = RoutingUploadedFileDataSerializer

    def get(self, request, *args, **kwargs):
        date = request.query_params.get('date', None)
        if not date:
            return Response({"error": "Date parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_staff:
            data = RoutingUploadedFileData.objects.filter(date_for_delivery=date)
        else:
            data = RoutingUploadedFileData.objects.filter(date_for_delivery=date, transport_company=request.user.username)

        serializer = self.serializer_class(data, many=True)
        return Response(serializer.data)


class RoutingUpdateDataView(api_generic_views.UpdateAPIView):
    def patch(self, request, *args, **kwargs):
        updated_data = request.data

        for record_id, fields in updated_data.items():
            try:
                record = RoutingUploadedFileData.objects.get(id=record_id)
                for field, value in fields.items():
                    setattr(record, field, value)
                record.save()
            except RoutingUploadedFileData.DoesNotExist:
                # If the record with the given id does not exist, skip it
                continue

        return Response({"message": "Data saved successfully."}, status=status.HTTP_200_OK)
