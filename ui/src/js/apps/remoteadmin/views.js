define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        Models = require('./models'),
        Forms = require('./forms'),
        Templates = require('./templates'),
        Views = {};

    Views.DjangoApps = Backbone.View.extend({
        initialize: function (options) {
            Backbone.View.prototype.initialize.call(this, options);

            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
        },

        render: function () {
            this.$el.html(Templates.AppModels({app_list: this.model.attributes.app_list}));
            this.delegateEvents();
            return this;
        }
    });

    return Views;
});
