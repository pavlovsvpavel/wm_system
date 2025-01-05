from django.contrib import admin
from import_export.admin import ExportMixin

from upload_files.models import UploadedFile, UploadedFileRowData


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'upload_date')


@admin.register(UploadedFileRowData)
class UploadedFileRowDataAdmin(ExportMixin, admin.ModelAdmin):
    list_display = (
        'id', 'file', 'serial_number', 'item_name', 'account_key', 'account_name', 'account_address',
        'account_bulstat', 'account_type', 'asset_model', 'warehouse', 'agent', 'agent_name',
        'asset_type', 'condition', 'scan_warehouse',
    )

    ordering = ('-file__upload_date',)

    list_filter = ('file__name',)
