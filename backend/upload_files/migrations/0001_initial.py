# Generated by Django 5.1.4 on 2025-01-30 10:45

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UploadedFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('upload_date', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_files', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Uploaded File',
                'verbose_name_plural': 'Uploaded Files',
            },
        ),
        migrations.CreateModel(
            name='UploadedFileRowData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pos_serial_number', models.CharField(blank=True, max_length=100, null=True)),
                ('whs_outlet', models.CharField(blank=True, max_length=20, null=True)),
                ('date_of_movement', models.CharField(blank=True, max_length=20, null=True)),
                ('outlet_whs_ext_code', models.CharField(blank=True, max_length=40, null=True)),
                ('outlet_whs_name', models.CharField(blank=True, max_length=255, null=True)),
                ('outlet_whs_address', models.CharField(blank=True, max_length=255, null=True)),
                ('vat_id', models.CharField(blank=True, max_length=20, null=True)),
                ('network_name', models.CharField(blank=True, max_length=255, null=True)),
                ('gps_coordinates', models.CharField(blank=True, max_length=100, null=True)),
                ('outlet_category', models.CharField(blank=True, max_length=30, null=True)),
                ('contract_exp_date', models.CharField(blank=True, max_length=20, null=True)),
                ('contract_number', models.CharField(blank=True, max_length=100, null=True)),
                ('pos_category', models.CharField(blank=True, max_length=50, null=True)),
                ('pos_type', models.CharField(blank=True, max_length=50, null=True)),
                ('pos_brand', models.CharField(blank=True, max_length=30, null=True)),
                ('pos_model', models.CharField(blank=True, max_length=100, null=True)),
                ('pos_asset_number', models.CharField(blank=True, max_length=255, null=True)),
                ('technical_condition', models.CharField(blank=True, max_length=100, null=True)),
                ('year_of_production', models.CharField(blank=True, max_length=20, null=True)),
                ('remark', models.CharField(blank=True, max_length=255, null=True)),
                ('last_inv_date', models.CharField(blank=True, max_length=20, null=True)),
                ('nm_name', models.CharField(blank=True, max_length=50, null=True)),
                ('rsm_name', models.CharField(blank=True, max_length=50, null=True)),
                ('asm_name', models.CharField(blank=True, max_length=50, null=True)),
                ('sr_code', models.CharField(blank=True, max_length=50, null=True)),
                ('sr_name', models.CharField(blank=True, max_length=50, null=True)),
                ('additional_comment', models.CharField(blank=True, max_length=255, null=True)),
                ('is_contract', models.CharField(blank=True, max_length=10, null=True)),
                ('is_protocol', models.CharField(blank=True, max_length=10, null=True)),
                ('scanned_technical_condition', models.CharField(blank=True, max_length=100, null=True)),
                ('scanned_outlet_whs_name', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('file', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rows', to='upload_files.uploadedfile')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_rows', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Uploaded File Data',
                'verbose_name_plural': 'Uploaded Files Data',
            },
        ),
    ]
