from django.contrib.admin.sites import site
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.core.serializers.json import simplejson as json
from django.forms import ModelForm
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.middleware.csrf import get_token, CsrfViewMiddleware
from django.utils.text import capfirst
from django.views.decorators.csrf import csrf_exempt

from django_remote_forms.forms import RemoteForm

from adminapi.apps.adminapi.forms import LoginForm
from adminapi.apps.adminapi.utils import LazyEncoder


@csrf_exempt
def handle_login(request):
    csrf_middleware = CsrfViewMiddleware()

    response_data = {}
    form = None

    if request.raw_post_data:
        request.POST = json.loads(request.raw_post_data)
        csrf_middleware.process_view(request, None, None, None)
        if 'data' in request.POST:
            form = LoginForm(data=request.POST['data'])
            if form.is_valid():
                if not request.POST['meta']['validate']:
                    auth_login(request, form.get_user())
    else:
        form = LoginForm(request)
        response_data['csrfmiddlewaretoken'] = get_token(request)

    if form is not None:
        remote_form = RemoteForm(form)
        response_data.update(remote_form.as_dict())

    response = HttpResponse(json.dumps(response_data, cls=LazyEncoder), mimetype="application/json")
    csrf_middleware.process_response(request, response)
    return response


def handle_logout(request):
    auth_logout(request)
    return HttpResponseRedirect('/')


def get_models(request, app_label=None):
    # Return data on all models registered with admin

    if not request.user.is_authenticated():
        return HttpResponse('Unauthorized request', status=401)

    has_module_perms = False
    if app_label is None:
        if request.user.is_staff or request.user.is_superuser:
            has_module_perms = True
    else:
        has_module_perms = request.user.has_module_perms(app_label)

    app_list = []

    for model, model_admin in site._registry.items():
        model_name = model._meta.module_name

        if app_label is not None and app_label != model._meta.app_label:
            continue
        else:
            current_app_label = model._meta.app_label

        is_new_app = True
        current_app_dict = {}
        for app_dict in app_list:
            if app_dict['label'] == current_app_label:
                current_app_dict = app_dict
                is_new_app = False
                break

        if has_module_perms:
            perms = model_admin.get_model_perms(request)

            # Check whether user has any perm for this module.
            # If so, add the module to the model_list.
            if True in perms.values():
                model_dict = {
                    'app_label': current_app_label,
                    'name': model_name,
                    'title': unicode(capfirst(model._meta.verbose_name_plural)),
                    'perms': perms,
                }

                if current_app_dict:
                    current_app_dict['models'].append(model_dict),
                else:
                    # First time around, now that we know there's
                    # something to display, add in the necessary meta
                    # information.
                    current_app_dict = {
                        'label': current_app_label,
                        'title': capfirst(current_app_label),
                        'has_module_perms': has_module_perms,
                        'models': [model_dict]
                    }
        # Sort the models alphabetically within each app.
        current_app_dict['models'].sort(key=lambda x: x['name'])
        if is_new_app:
            app_list.append(current_app_dict)

    if not app_list:
        raise Http404('The requested admin page does not exist')

    response_data = {
        'app_list': app_list
    }

    return HttpResponse(json.dumps(response_data, cls=LazyEncoder), mimetype="application/json")


def get_model_instances(request, app_label, model_name):
    if not request.user.is_authenticated():
        return HttpResponse('Unauthorized', status=401)

    # Return list of instances for a given model
    response_data = {
        'name': model_name,
        'header': [],
        'instances': [],
        'admin': {}
    }

    for model, model_admin in site._registry.items():
        current_app_label = ''
        if app_label != model._meta.app_label or model_name != model._meta.module_name:
            continue
        else:
            current_app_label = model._meta.app_label

        response_data['admin'].update({
            'list_display': model_admin.list_display,
            'list_editable': model_admin.list_editable,
            'ordering': model_admin.ordering
        })

        if 'app' not in response_data:
            response_data['app'] = {
                'label': current_app_label,
                'title': capfirst(current_app_label)
            }

        if 'title' not in response_data:
            response_data['title'] = unicode(capfirst(model._meta.verbose_name_plural))

        is_header_generated = False

        for model_instance in model.objects.all():
            instance_data = {
                'id': model_instance.pk,
                'name': model_name,
                'app_label': app_label,
                'list_data': {
                    'lead': None,
                    'rest': []
                }
            }

            if '__str__' in response_data['admin']['list_display']:
                instance_data['list_data']['rest'] = (model_instance.pk, unicode(model_instance),)

                if not is_header_generated:
                    response_data['header'] = ('ID', 'Title',)
            else:
                for instance_property_name in response_data['admin']['list_display']:
                    instance_property_value = getattr(model_instance, instance_property_name, '')
                    if callable(instance_property_value):
                        instance_property_value = instance_property_value()

                    instance_property_value = unicode(instance_property_value)

                    if not is_header_generated:
                        normalized_instance_property_name = instance_property_name
                        if '__' in instance_property_name:
                            normalized_instance_property_name = ' '.join(instance_property_name.split('__')[1:])

                        normalized_instance_property_name = capfirst(normalized_instance_property_name)
                        response_data['header'].append(normalized_instance_property_name)

                    instance_data['list_data']['rest'].append(instance_property_value)

            if not is_header_generated:
                is_header_generated = True

            # Split the list of values
            instance_data['list_data']['lead'] = instance_data['list_data']['rest'][0]
            instance_data['list_data']['rest'] = instance_data['list_data']['rest'][1:]

            response_data['instances'].append(instance_data)

    return HttpResponse(json.dumps(response_data, cls=LazyEncoder), mimetype="application/json")


@csrf_exempt
def handle_instance_form(request, app_label, model_name, instance_id=None):
    if not request.user.is_authenticated():
        return HttpResponse('Unauthorized', status=401)

    csrf_middleware = CsrfViewMiddleware()

    response_data = {
        'meta': {
            'app_label': app_label,
            'model_name': model_name
        },

        'admin': {}
    }

    instance = None

    for model, model_admin in site._registry.items():
        if app_label != model._meta.app_label or model_name != model._meta.module_name:
            continue

        field_configuration = {
            'include': model_admin.fields or [],
            'exclude': model_admin.exclude or [],
            'ordering': model_admin.fields or [],
            'fieldsets': model_admin.fieldsets or {},
            'readonly': model_admin.readonly_fields or []
        }

        if instance_id is not None:
            response_data[instance_id] = instance_id
            try:
                instance = model.objects.get(pk=instance_id)
            except model.DoesNotExist:
                raise Http404('Invalid instance ID')

        current_model = model

        class CurrentModelForm(ModelForm):
            class Meta:
                model = current_model

        if request.method == 'GET':
            # Return instance form for given model name
            # Return initial values if instance ID is supplied, otherwise return empty form
            if instance is None:
                form = CurrentModelForm()
            else:
                form = CurrentModelForm(instance=instance)
                for field_name, initial_value in form.initial.items():
                    if initial_value is not None and field_name in form.fields:
                        form.fields[field_name].initial = initial_value

            response_data['csrfmiddlewaretoken'] = get_token(request)

            remote_form = RemoteForm(form, **field_configuration)
            response_data.update(remote_form.as_dict())
        elif request.raw_post_data:
            request.POST = json.loads(request.raw_post_data)
            csrf_middleware.process_view(request, None, None, None)
            if 'data' in request.POST:
                if instance_id is None:
                    form = CurrentModelForm(request.POST['data'])
                else:
                    form = CurrentModelForm(request.POST['data'], instance=instance)
                if form.is_valid():
                    if not request.POST['meta']['validate']:
                        form.save()

                remote_form = RemoteForm(form, **field_configuration)
                response_data.update(remote_form.as_dict())

    response = HttpResponse(json.dumps(response_data, cls=LazyEncoder), mimetype="application/json")
    csrf_middleware.process_response(request, response)
    return response
