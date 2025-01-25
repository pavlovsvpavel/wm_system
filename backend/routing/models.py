from django.db import models

from accounts.models import UserAccount


class RoutingUploadedFileData(models.Model):
    type_of_route = models.CharField(max_length=30, blank=False, null=False)
    sr_name = models.CharField(max_length=100, blank=False, null=False)
    region = models.CharField(max_length=30, blank=False, null=False)
    company_name = models.CharField(max_length=100, blank=False, null=False)
    outlet_name = models.CharField(max_length=100, blank=False, null=False)
    delivery_address = models.CharField(max_length=100, blank=False, null=False)
    pos_model = models.CharField(max_length=100, blank=True, null=True)
    pos_serial_number = models.CharField(max_length=100, blank=True, null=True)
    comment = models.TextField(blank=True, null=True)
    transport_company = models.CharField(max_length=100, blank=False, null=False)
    date_for_delivery = models.DateField(blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='user_routes')




