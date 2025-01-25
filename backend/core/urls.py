from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/files/', include('upload_files.urls')),
    path('api/db/', include('search_db.urls')),
    path('api/export/', include('export_files.urls')),
    path('api/routing/', include('routing.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-styles/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-styles'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
