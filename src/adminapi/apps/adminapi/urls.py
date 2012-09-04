from django.conf.urls import patterns, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^login/$', 'adminapi.apps.adminapi.views.handle_login', name='adminapi_handle_login'),
    url(r'^apps/$', 'adminapi.apps.adminapi.views.get_models', name='adminapi_get_all_models'),
    url(r'^apps/(?P<app_label>\w+)/models/$', 'adminapi.apps.adminapi.views.get_models', name='adminapi_get_models'),
    url(r'^apps/(?P<app_label>\w+)/models/(?P<model_name>\w+)/instances/$', 'adminapi.apps.adminapi.views.get_model_instances', name='adminapi_get_model_instances'),
    url(r'^apps/(?P<app_label>\w+)/models/(?P<model_name>\w+)/instances/form/$', 'adminapi.apps.adminapi.views.handle_instance_form', name='adminapi_handle_instance_add_form'),
    url(r'^apps/(?P<app_label>\w+)/models/(?P<model_name>\w+)/instances/(?P<instance_id>\d+)/form/$', 'adminapi.apps.adminapi.views.handle_instance_form', name='adminapi_handle_instance_edit_form'),
)
