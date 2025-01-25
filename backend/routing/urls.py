from django.urls import path

from routing.views import RoutingRetrieveDataView, RoutingUpdateDataView, RoutingUploadedFileDataView

urlpatterns = [
    path('upload-data/', RoutingUploadedFileDataView.as_view(), name='upload-data'),
    path('get-data/', RoutingRetrieveDataView.as_view(), name='routing-get-data'),
    path('update-data/', RoutingUpdateDataView.as_view(), name='routing-update-data'),
]
