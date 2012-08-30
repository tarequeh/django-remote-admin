from django.contrib.admin.sites import site
from django.core.serializers.json import simplejson as json
from django.forms import ModelForm
from django.http import Http404, HttpResponse
from django.middleware.csrf import get_token, CsrfViewMiddleware
from django.utils.text import capfirst
from django.views.decorators.csrf import csrf_exempt

from django_remote_forms.forms import RemoteForm

from adminapi.apps.adminapi.utils import LazyEncoder


def handle_login(request):
    if request.method == 'GET':
        # Return login form
        pass
    elif request.method == 'POST':
        # Process login
        pass


def get_models(request, app_label=None):
    # Return data on all models registered with admin
    user = request.user

    has_module_perms = False
    if app_label is None:
        if user.is_staff or user.is_superuser:
            has_module_perms = True
    else:
        has_module_perms = user.has_module_perms(app_label)

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
    # Return list of instances for a given model
    response_data = {
        'name': model_name,
        'instances': []
    }

    for model, model_admin in site._registry.items():
        current_app_label = ''
        if app_label != model._meta.app_label or model_name != model._meta.module_name:
            continue
        else:
            current_app_label = model._meta.app_label

        if 'app' not in response_data:
            response_data['app'] = {
                'label': current_app_label,
                'title': capfirst(current_app_label)
            }

        if 'title' not in response_data:
            response_data['title'] = unicode(capfirst(model._meta.verbose_name_plural))

        for model_instance in model.objects.all():
            response_data['instances'].append({
                'id': model_instance.pk,
                'name': model_name,
                'app_label': app_label,
                'title': unicode(model_instance)
            })

    return HttpResponse(json.dumps(response_data, cls=LazyEncoder), mimetype="application/json")


@csrf_exempt
def handle_instance_form(request, app_label, model_name, instance_id=None):
    csrf_middleware = CsrfViewMiddleware()

    response_data = {
        'meta': {
            'app_label': app_label,
            'model_name': model_name
        }
    }

    instance = None

    for model, model_admin in site._registry.items():
        if app_label != model._meta.app_label or model_name != model._meta.module_name:
            continue

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

            remote_form = RemoteForm(form)
            response_data.update(remote_form.as_dict())

            response_data['meta']['data'] = {}
            for field_name, field in response_data['fields'].items():
                if field['initial'] is not None:
                    response_data['meta']['data'][field_name] = field['initial']

        elif request.raw_post_data:
            request.POST = json.loads(request.raw_post_data)
            csrf_middleware.process_view(request, None, None, None)
            if 'meta' in request.POST and 'data' in request.POST['meta']:
                if instance_id is None:
                    form = CurrentModelForm(request.POST['meta']['data'])
                else:
                    form = CurrentModelForm(request.POST['meta']['data'], instance=instance)
                if form.is_valid():
                    form.save()

                remote_form = RemoteForm(form)
                response_data.update(remote_form.as_dict())

    response = HttpResponse(json.dumps(response_data, cls=LazyEncoder), mimetype="application/json")
    csrf_middleware.process_response(request, response)
    return response
