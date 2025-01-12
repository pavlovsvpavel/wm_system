import re

from django.db import models

class UploadedFile(models.Model):
    name = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)

    def remove_file_extension(self):
        # Split the string by the last period using a regex
        base_name = re.sub(r'\.([^.]+)$', '', self.name)
        return base_name

    def __str__(self):
        return self.remove_file_extension()

class UploadedFileRowData(models.Model):
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='rows')
    pos_serial_number = models.CharField(max_length=255, blank=True, null=True)
    whs_outlet = models.CharField(max_length=255, blank=True, null=True)
    date_of_movement = models.CharField(max_length=255, blank=True, null=True)
    outlet_whs_ext_code = models.CharField(max_length=255, blank=True, null=True)
    outlet_whs_name = models.CharField(max_length=255, blank=True, null=True)
    outlet_whs_address = models.CharField(max_length=255, blank=True, null=True)
    vat_id = models.CharField(max_length=255, blank=True, null=True)
    network_name = models.CharField(max_length=255, blank=True, null=True)
    gps_coordinates = models.CharField(max_length=255, blank=True, null=True)
    outlet_category = models.CharField(max_length=255, blank=True, null=True)
    contract_exp_date = models.CharField(max_length=255, blank=True, null=True)
    contract_number = models.CharField(max_length=255, blank=True, null=True)
    pos_category = models.CharField(max_length=255, blank=True, null=True)
    pos_type = models.CharField(max_length=255, blank=True, null=True)
    pos_brand = models.CharField(max_length=255, blank=True, null=True)
    pos_model = models.CharField(max_length=255, blank=True, null=True)
    pos_asset_number = models.CharField(max_length=255, blank=True, null=True)
    technical_condition = models.CharField(max_length=255, blank=True, null=True)
    year_of_production = models.CharField(max_length=255, blank=True, null=True)
    remark = models.CharField(max_length=255, blank=True, null=True)
    last_inv_date = models.CharField(max_length=255, blank=True, null=True)
    nm_name = models.CharField(max_length=255, blank=True, null=True)
    rsm_name = models.CharField(max_length=255, blank=True, null=True)
    asm_name = models.CharField(max_length=255, blank=True, null=True)
    sr_code = models.CharField(max_length=255, blank=True, null=True)
    sr_name = models.CharField(max_length=255, blank=True, null=True)
    additional_comment = models.CharField(max_length=255, blank=True, null=True)
    is_contract = models.CharField(max_length=255, blank=True, null=True)
    is_protocol = models.CharField(max_length=255, blank=True, null=True)
    scanned_technical_condition = models.CharField(max_length=255, blank=True, null=True)
    scanned_outlet_whs_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    # @property
    # def file_id(self):
    #     file_id = self.file.id
    #
    #     return file_id

    def __str__(self):
        return self.file.name
