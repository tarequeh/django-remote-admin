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
            '/apps/:app_label/models/:model_name/instances/form/': 'load_model_add_form',
            '/apps/:app_label/models/:model_name/instances/:instance_id/form/': 'load_model_edit_form'
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

            this.django_app_model = new Models.DjangoApp();
            this.django_apps_view = new Views.DjangoApps({model: this.django_app_model});
            $('#content').append(this.django_apps_view.el);
        },

        load_all_models: function () {
            this.django_app_model.app_label = null;
            this.django_app_model.fetch();
        },

        load_models: function (app_label) {
            this.django_app_model.app_label = app_label;
            this.django_app_model.fetch();
        },

        load_model_instances: function (app_label, model_name) {

        },

        load_model_add_form: function (app_label, model_name) {

        },

        load_model_edit_form: function (app_label, model_name, instance_id) {

        }
    });
    return Routers;
});
