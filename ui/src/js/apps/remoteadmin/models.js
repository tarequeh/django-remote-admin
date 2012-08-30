define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        Models = {};

    Models.DjangoApp = Backbone.Model.extend({
        base_url: '/adminapi/apps/',

        initialize: function (options) {
            Backbone.Model.prototype.initialize.call(this, options);

            options = options ? _.clone(options) : {};
            this.app_label = options.app_label;
        },

        url: function () {
            var url = this.base_url;
            if (this.app_label) {
                url += this.app_label + '/models/';
            }

            return url;
        }
    });

    Models.DjangoModel = Backbone.Model.extend({
        base_url: '/adminapi/apps/',

        initialize: function (options) {
            Backbone.Model.prototype.initialize.call(this, options);

            options = options ? _.clone(options) : {};
            this.app_label = options.app_label;
            this.model_name = options.model_name;
        },

        url: function () {
            return this.base_url + this.app_label + '/models/' + this.model_name + '/instances/';
        }
    });

    return Models;
});
