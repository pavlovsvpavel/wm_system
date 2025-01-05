from django.contrib import admin
from accounts.models import UserAccount


@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ("username", "is_staff", "is_superuser", "id",)

    def save_model(self, request, obj, form, change):
        if 'password' in form.cleaned_data and not obj.check_password(form.cleaned_data['password']):
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)
