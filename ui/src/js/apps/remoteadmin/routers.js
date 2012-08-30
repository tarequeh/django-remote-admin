define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        Models = require('./models'),
        Views = require('./views'),
        Routers = {};

    Routers.RemoteAdmin = Backbone.Router.extend({
        routes: {
            '': 'load_all_models',
            '/': 'load_all_models',
            '/apps/': 'load_all_models',
            '/apps/:app_label/': 'load_models',
            '/apps/:app_label/models/:model_name/instances/': 'load_model_instances',
            '/apps/:app_label/models/:model_name/instances/add/': 'load_model_add_form',
            '/apps/:app_label/models/:model_name/instances/:instance_id/edit/': 'load_model_edit_form'
        },

        initialize: function (options) {
            Backbone.Router.prototype.initialize.call(this, options);
            _.bindAll(this,
                'load_all_models',
                'load_models',
                'load_model_instances',
                'load_model_add_form',
                'load_model_edit_form'
            );
        },

        load_all_models: function () {
            var django_app_model = new Models.DjangoApp();
            var django_apps_view = new Views.DjangoApps({model: django_app_model});
            $('#content').html(django_apps_view.el);
            django_app_model.fetch();
        },

        load_models: function (app_label) {
            var django_app_model = new Models.DjangoApp({app_label: app_label});
            var django_apps_view = new Views.DjangoApps({model: django_app_model});
            $('#content').html(django_apps_view.el);
            django_app_model.fetch();
        },

        load_model_instances: function (app_label, model_name) {
            var django_model_model = new Models.DjangoModel({
                app_label: app_label,
                model_name: model_name
            });
            var django_model_instances_view = new Views.DjangoModelInstances({model: django_model_model});
            $('#content').html(django_model_instances_view.el);
            django_model_model.fetch();
        },

        load_model_add_form: function (app_label, model_name) {
            var django_model_model = new Models.DjangoModel({
                app_label: app_label,
                model_name: model_name
            });

            var add_instance_form_view = new Views.DjangoModelInstance({model: django_model_model});
            $('#content').html(add_instance_form_view.el);
            django_model_model.fetch();
        },

        load_model_edit_form: function (app_label, model_name, instance_id) {

        }
    });
    return Routers;
});
