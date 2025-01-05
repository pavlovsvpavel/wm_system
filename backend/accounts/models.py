from django.db import models
from django.contrib.auth import models as auth_models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from accounts.managers import UserAccountManager


class UserAccount(auth_models.AbstractBaseUser, auth_models.PermissionsMixin):
    username = models.CharField(
        _("username"),
        unique=True,
        error_messages={
            "unique": _("User with that username already exists."),
        },
    )

    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
    )

    is_active = models.BooleanField(
        _("active"),
        default=True,
    )

    date_joined = models.DateTimeField(
        _("date joined"),
        default=timezone.now
    )

    USERNAME_FIELD = "username"

    objects = UserAccountManager()
