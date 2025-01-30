from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from rangefilter.filters import DateRangeFilter

from routing.models import RoutingUploadedFileData
from routing.resources import RoutingUploadedFileDataResource


@admin.register(RoutingUploadedFileData)
class RoutingUploadedFileDataAdmin(ImportExportModelAdmin):
    resource_class = RoutingUploadedFileDataResource
    ordering = ('-date_for_delivery',)

    list_display = ("date_for_delivery", "pos_serial_number", "type_of_route", "sr_name", "region", "company_name",
                    "outlet_name", "delivery_address", "pos_model",
                    "comment", "transport_company",
                    "created_at", "updated_at", "id",)

    list_filter = (("date_for_delivery", DateRangeFilter), "type_of_route", "transport_company", "region",)
    search_fields = ('pos_serial_number',)
    search_help_text = "Search by pos serial number"

    @classmethod
    def get_export_resource_class(cls):
        return RoutingUploadedFileDataResource

    def has_add_permission(self, request):
        return False

