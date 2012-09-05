define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        Models = require('./models'),
        Forms = require('./forms'),
        Templates = require('./templates'),
        Views = {};

    Views.Login = Backbone.View.extend({
        initialize: function(options) {
            Backbone.View.prototype.initialize.call(this, options);
            _.bindAll(this, 'render');
            $('.logout').hide();
        },

        render: function () {
            this.$el.html(Templates.Login());

            var login_form_model = new Forms.Login();

            var login_form_view = new Forms.View({
                model: login_form_model,
                spotcheck: true,
                redirect_url: '#/apps/'
            });
            this.$('.login_form').html(login_form_view.el);
            login_form_model.fetch();

            this.delegateEvents();
            return this;
        }
    });

    Views.DjangoApps = Backbone.View.extend({
        initialize: function (options) {
            Backbone.View.prototype.initialize.call(this, options);

            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
        },

        render: function () {
            $('.logout').show();
            this.$el.html(Templates.AppModels({app_list: this.model.attributes.app_list}));
            this.delegateEvents();
            return this;
        }
    });

    Views.DjangoModelInstances = Backbone.View.extend({
        initialize: function (options) {
            Backbone.View.prototype.initialize.call(this, options);
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
        },

        render: function () {
            $('.logout').show();
            this.$el.html(Templates.ModelInstances({model_data: this.model.attributes}));
            this.delegateEvents();
            return this;
        }
    });

    Views.DjangoModelInstance = Views.DjangoModelInstances.extend({
        initialize: function (options) {
            Views.DjangoModelInstances.prototype.initialize.call(this, options);

            options = options ? _.clone(options) : {};

            this.instance_id = options.instance_id;
        },

        render: function () {
            $('.logout').show();
            this.$el.html(Templates.ModelInstance({model_data: this.model.attributes}));

            var instance_form_model = new Forms.DjangoModelInstance({
                app_label: this.model.attributes.app.label,
                model_name: this.model.attributes.name,
                instance_id: this.instance_id,
                buttons: [{
                    'class': 'submit',
                    'name': 'submit',
                    'display_text': 'Save',
                    'message': 'Successfully updated ' + this.model.attributes.name
                }]
            });

            var instance_form_view = new Forms.View({
                model: instance_form_model,
                prefill: true
            });
            this.$('.model_instance_form').html(instance_form_view.el);
            instance_form_model.fetch();

            this.delegateEvents();
            return this;
        }
    });

    return Views;
});
