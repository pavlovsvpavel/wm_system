from rest_framework import serializers

class QRCodeSearchSerializer(serializers.Serializer):
    qr_code = serializers.CharField(required=True)
    file_id = serializers.IntegerField(required=True)
    condition_data = serializers.CharField(required=False, allow_blank=True)
    scan_warehouse_data = serializers.CharField(required=False, allow_blank=True)