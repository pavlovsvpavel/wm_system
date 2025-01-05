from import_export import resources, fields

from upload_files.models import UploadedFileRowData


class UploadedFileRowDataResource(resources.ModelResource):
    file_name = fields.Field(attribute='file_name', column_name='File Name')

    class Meta:
        model = UploadedFileRowData
        fields = [
            'file_name', 'serial_number', 'item_name', 'account_key', 'account_name', 'account_address',
            'account_bulstat', 'account_type', 'asset_model', 'warehouse', 'agent',
            'agent_name', 'asset_type', 'condition', 'scan_warehouse', 'created_at', 'updated_at',
        ]

    def dehydrate_file_name(self, row):
        return row.file.name if row.file else 'No file'
