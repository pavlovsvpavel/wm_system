from import_export import resources, fields

from upload_files.models import UploadedFileRowData


class UploadedFileRowDataResource(resources.ModelResource):
    file_name = fields.Field(attribute='file_name', column_name='File Name')
    user = fields.Field(attribute='user', column_name='User')

    class Meta:
        model = UploadedFileRowData
        fields = [
            'whs_outlet',
            'date_of_movement',
            'outlet_whs_ext_code',
            'outlet_whs_name',
            'outlet_whs_address',
            'vat_id',
            'network_name',
            'gps_coordinates',
            'outlet_category',
            'contract_exp_date',
            'contract_number',
            'pos_category',
            'pos_type',
            'pos_brand',
            'pos_model',
            'pos_serial_number',
            'pos_asset_number',
            'technical_condition',
            'year_of_production',
            'remark',
            'last_inv_date',
            'nm_name',
            'rsm_name',
            'asm_name',
            'sr_code',
            'sr_name',
            'additional_comment',
            'is_contract',
            'is_protocol',
            'scanned_technical_condition',
            'scanned_outlet_whs_name',
            'created_at',
            'updated_at',
            'file_name',
            'user',
        ]

    def dehydrate_file_name(self, row):
        return row.file.name if row.file else 'No file'
