from django.contrib import admin
from import_export.admin import ExportMixin

from upload_files.models import UploadedFile, UploadedFileRowData


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'upload_date', 'user',)


@admin.register(UploadedFileRowData)
class UploadedFileRowDataAdmin(ExportMixin, admin.ModelAdmin):
    list_display = (
        'id', 'file', 'pos_serial_number', 'outlet_whs_name',
        'scanned_technical_condition', 'scanned_outlet_whs_name',
        'created_at', 'updated_at', 'user',
    )

    search_fields = ('pos_serial_number',)
    search_help_text = "Search by pos serial number"
    ordering = ('-file__upload_date',)
    list_filter = ('file__name',)
