from django.contrib import admin
from django.http.response import HttpResponseRedirect
from import_export.admin import ExportMixin
from rangefilter.filters import DateRangeFilter
from accounts.mixins import IsStaffUserMixin
from upload_files.helpers.generate_pdf_with_qr_codes import generate_pdf
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

    actions = ['export_selected_qr_pdf']

    search_fields = ('pos_serial_number',)
    search_help_text = "Search by pos serial number"
    ordering = ('-file__upload_date',)
    list_filter = (('updated_at', DateRangeFilter), 'user__username', 'file__name', 'scanned_technical_condition',)

    def has_add_permission(self, request):
        return False

    def export_selected_qr_pdf(self, request, queryset):
        queryset = queryset.filter(scanned_technical_condition__icontains="QR")
        unique_files = queryset.order_by().values_list('file__name', flat=True).distinct()
        file_names = ", ".join(str(name) for name in unique_files if name)

        if not queryset.exists():
            self.message_user(request, f"No selected items with QR flag in selected file", level='warning')
            return

        if len(unique_files) > 1:
            self.message_user(
                request,
                f"Error: Multiple files selected ({file_names}). "
                "Please select only one file.",
                level='error'
            )
            return HttpResponseRedirect(request.get_full_path())

        return generate_pdf(queryset)

    export_selected_qr_pdf.short_description = "Export selected items with QR flags to PDF"
