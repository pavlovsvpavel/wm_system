from django.db import models

class UploadedFile(models.Model):
    name = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)

    def remove_file_extension(self):
        return self.name.split('.')[0]

    def __str__(self):
        return self.remove_file_extension()

class UploadedFileRowData(models.Model):
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='rows')
    serial_number = models.CharField(max_length=255, blank=True, null=True)
    item_name = models.CharField(max_length=255, blank=True, null=True)
    account_key = models.CharField(max_length=255, blank=True, null=True)
    account_name = models.CharField(max_length=255, blank=True, null=True)
    account_address = models.CharField(max_length=255, blank=True, null=True)
    account_bulstat = models.CharField(max_length=255, blank=True, null=True)
    account_type = models.CharField(max_length=255, blank=True, null=True)
    asset_model = models.CharField(max_length=255, blank=True, null=True)
    warehouse = models.CharField(max_length=255, blank=True, null=True)
    agent = models.CharField(max_length=255, blank=True, null=True)
    agent_name = models.CharField(max_length=255, blank=True, null=True)
    asset_type = models.CharField(max_length=255, blank=True, null=True)
    condition = models.CharField(max_length=255, blank=True, null=True)
    scan_warehouse = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.file.name

