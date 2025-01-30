from import_export import resources
from import_export.fields import Field
from routing.models import RoutingUploadedFileData


class RoutingUploadedFileDataResource(resources.ModelResource):
    # Map Excel columns to model fields
    type_of_route = Field(attribute='type_of_route', column_name='Type of route')
    sr_name = Field(attribute='sr_name', column_name='Organizational Structure Object')
    region = Field(attribute='region', column_name='Geography Object')
    company_name = Field(attribute='company_name', column_name=' Legal Name of an Outlet')
    outlet_name = Field(attribute='outlet_name', column_name='Actual Name of an Outlet')
    delivery_address = Field(attribute='delivery_address', column_name='Delivery Address')
    pos_model = Field(attribute='pos_model', column_name='POS Equipment')
    pos_serial_number = Field(attribute='pos_serial_number', column_name='Serial Number')
    comment = Field(attribute='comment', column_name='Comment')
    transport_company = Field(attribute='transport_company', column_name='Additional Comment')
    date_for_delivery = Field(attribute='date_for_delivery', column_name='Fact Delivery Date')

    class Meta:
        model = RoutingUploadedFileData

        fields = ("type_of_route", "sr_name", "region",
                  "company_name", "outlet_name", "delivery_address", "pos_model", "pos_serial_number",
                  "comment", "transport_company", "date_for_delivery", "created_at", "updated_at",)

        export_order = ("type_of_route", "sr_name", "region",
                        "company_name", "outlet_name", "delivery_address", "pos_model", "pos_serial_number",
                        "comment", "transport_company", "date_for_delivery", "created_at", "updated_at",)

        import_id_fields = []
