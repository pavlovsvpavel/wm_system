from django.contrib import admin
from import_export.admin import ExportMixin
from routing.models import RoutingUploadedFileData


@admin.register(RoutingUploadedFileData)
class RoutingUploadedFileDataAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ("id", "type_of_route", "sr_name", "region", "company_name",
                    "outlet_name", "delivery_address", "pos_model",
                    "pos_serial_number", "comment", "transport_company", "date_for_delivery",
                    "created_at", "updated_at", "user")

    list_filter = ("type_of_route", "region", "transport_company", "date_for_delivery")
