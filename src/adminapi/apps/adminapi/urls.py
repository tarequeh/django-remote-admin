from django.conf.urls import patterns, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^(apps/(?P<app_label>\w+)/models/)?$', 'adminapi.views.get_models', name='adminapi_view_models'),
    url(r'^apps/(?P<app_label>\w+)/models/(?P<model_name>\w+)/instances/$', 'adminapi.views.get_model_instances', name='adminapi_get_model_instances'),
    url(r'^apps/(?P<app_label>\w+)/models/(?P<model_name>\w+)/instances/((?P<instance_id>\d+)/)?form/$', 'adminapi.views.handle_instance_form', name='adminapi_handle_instance_form'),
)
