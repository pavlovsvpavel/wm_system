from django.utils import timezone
from django.db import transaction
from rest_framework import generics as api_generic_views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.permissions import IsAuthenticatedPermission
from routing.models import RoutingUploadedFileData
from routing.serializers import RoutingUploadedFileDataSerializer


class RoutingRetrieveDataView(api_generic_views.RetrieveAPIView):
    serializer_class = RoutingUploadedFileDataSerializer
    permission_classes = [IsAuthenticated, IsAuthenticatedPermission]

    def get(self, request, *args, **kwargs):
        date = request.query_params.get('date', None)
        if not date:
            return Response({"error": "Date parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_staff:
            data = RoutingUploadedFileData.objects.filter(date_for_delivery=date)
        else:
            data = RoutingUploadedFileData.objects.filter(date_for_delivery=date,
                                                          transport_company=request.user.username)

        serializer = self.serializer_class(data, many=True)
        return Response(serializer.data)


class RoutingUpdateDataView(api_generic_views.UpdateAPIView):
    serializer_class = RoutingUploadedFileDataSerializer
    permission_classes = [IsAuthenticated, IsAuthenticatedPermission]

    def patch(self, request, *args, **kwargs):
        updated_data = request.data
        record_ids = list(updated_data.keys())
        user = request.user
        current_time = timezone.now()

        try:
            with transaction.atomic():
                records = RoutingUploadedFileData.objects.in_bulk(record_ids)

                updates = []
                for record_id, fields in updated_data.items():
                    record = records.get(int(record_id))
                    if not record:
                        continue  # Skip non-existent records

                    serializer = self.serializer_class(record, data=fields, partial=True)
                    serializer.is_valid(raise_exception=True)

                    for field, value in serializer.validated_data.items():
                        setattr(record, field, value)
                    if hasattr(record, 'user'):
                        record.user = user

                    # Manually update the timestamp
                    record.updated_at = current_time
                    updates.append(record)

                # Bulk update all records in one query
                if updates:
                    model_fields = [f.name for f in RoutingUploadedFileData._meta.fields
                                    if f.name not in ['id', 'created_at']]

                    RoutingUploadedFileData.objects.bulk_update(
                        updates,
                        fields=model_fields
                    )

                return Response({"message": f"Updated {len(updates)} records successfully."},
                                status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
