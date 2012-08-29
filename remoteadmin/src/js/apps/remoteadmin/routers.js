define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        Models = require('./models'),
        Views = require('./views'),
        Forms = {};

    var routers = {};
    routers.Charts = Backbone.Router.extend({
        routes: {
            '/': 'load_all_models',
            '/apps/': 'load_all_models',
            '/apps/:app_label': 'load_models',
            '/apps/:app_label/models/:model_name/instances/': 'load_model_instances',
            '/apps/:app_label/models/:model_name/instances/form/': 'load_model_add_form',
            '/apps/:app_label/models/:model_name/instances/:instance_id/form/': 'load_model_edit_form'
        },

        initialize: function (options) {
            Backbone.Router.prototype.initialize.call(this, options);
            _.bindAll(this,
                'index',
                'load_all_models',
                'load_models',
                'load_model_instances',
                'load_model_add_form',
                'load_model_edit_form'
            );
        },

        load_all_models: function () {

        },

        load_models: function (app_label) {

        },

        load_model_instances: function (app_label, model_name) {

        },

        load_model_add_form: function (app_label, model_name) {

        },

        load_model_edit_form: function (app_label, model_name, instance_id) {

        }
    });
    return routers;
});
