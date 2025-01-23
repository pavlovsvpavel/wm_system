class IsStaffUserMixin:
    def get_queryset(self, request):
        queryset = super().get_queryset(request)

        if request.user.is_superuser:
            queryset = queryset

        elif request.user.is_staff:
            queryset = queryset.filter(user__is_superuser=False)

        return queryset

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True

        if obj and obj.user != request.user:
            return False

        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True

        if obj and obj.user != request.user:
            return False

        return super().has_delete_permission(request, obj)


class GetModelQuerySetMixin:
    def get_queryset(self, request, model):
        if request.user.is_superuser:
            return model.objects.select_related('user').all()

        return model.objects.select_related('user').filter(user__is_staff=True, user__is_superuser=False)