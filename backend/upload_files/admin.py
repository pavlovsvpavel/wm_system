from django.contrib import admin
from import_export.admin import ExportMixin
from rangefilter.filters import DateRangeFilter

from accounts.mixins import IsStaffUserMixin
from upload_files.models import UploadedFile, UploadedFileRowData


@admin.register(UploadedFile)
class UploadedFileAdmin(IsStaffUserMixin, admin.ModelAdmin):
    list_display = ('id', 'name', 'upload_date', 'user',)
    list_filter = (('upload_date', DateRangeFilter), 'user__username',)

    def has_add_permission(self, request):
        return False


@admin.register(UploadedFileRowData)
class UploadedFileRowDataAdmin(IsStaffUserMixin, ExportMixin, admin.ModelAdmin):
    list_display = (
        'id', 'file', 'pos_serial_number', 'outlet_whs_name',
        'scanned_technical_condition', 'scanned_outlet_whs_name',
        'created_at', 'updated_at', 'user',
    )

    search_fields = ('pos_serial_number',)
    search_help_text = "Search by pos serial number"
    ordering = ('-file__upload_date',)
    list_filter = (('updated_at', DateRangeFilter), 'user__username', 'file__name',)

    def has_add_permission(self, request):
        return False
