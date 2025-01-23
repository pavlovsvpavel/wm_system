from django.contrib import admin
from django.contrib.auth.hashers import make_password

from accounts.mixins import IsStaffUserMixin
from accounts.models import UserAccount, UserAccountTechnicalCondition, UserAccountWhsName


@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ("username", "is_staff", "is_superuser", "id",)

    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get("password") and not change:
            obj.password = make_password(obj.password)

        elif change:
            original_password = UserAccount.objects.get(pk=obj.pk).password
            if original_password != obj.password:
                obj.password = make_password(obj.password)

        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if request.user.is_superuser:
            queryset = queryset

        elif request.user.is_staff:
            queryset = queryset.filter(is_superuser=request.user.is_superuser)

        return queryset

    def get_fieldsets(self, request, obj=None):
        fieldsets = (
            (None, {'fields': ('username', 'password')}),
            ('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
            ('Important dates', {'fields': ('last_login', 'date_joined')}),
        )

        # Adjust fieldsets for non-superusers
        if not request.user.is_superuser:
            fieldsets = (
                (None, {'fields': ('username', 'password')}),
            )

        return fieldsets

    def has_change_permission(self, request, obj=None):
        if not request.user.is_staff and obj and obj != request.user:
            return False

        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if not request.user.is_staff and obj and obj != request.user:
            return False

        return super().has_delete_permission(request, obj)


@admin.register(UserAccountTechnicalCondition)
class UserAccountTechnicalConditionsAdmin(IsStaffUserMixin, admin.ModelAdmin):
    list_display = ("technical_condition", "user")
    list_filter = ('user__username',)


@admin.register(UserAccountWhsName)
class UserAccountWhsNamesAdmin(IsStaffUserMixin, admin.ModelAdmin):
    list_display = ("whs_name", "user")
    list_filter = ('user__username',)
