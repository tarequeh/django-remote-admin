define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        Templates = require('./templates'),
        Utils = require('./utils'),
        Forms = {};

    Forms.Model = Backbone.Model.extend({
        initialize: function (options) {
            Backbone.Model.prototype.initialize.call(this, options);

            _.bindAll(this, 'transform', 'is_successfully_synced');

            options = options || {};
            this.name = options.name;
            this.title = options.title;
            this.allow_buttons = options.allow_buttons;

            if (this.allow_buttons !== false) {
                this.allow_buttons = true;
            }

            this.buttons = options.buttons || [];
            this.bind('fetched', this.transform);
        },

        url: function () {
            return '';
        },

        fetch: function (options) {
            options = options || {};
            options.success = function (model, resp) {
                model.trigger('fetched');
            };

            Backbone.Model.prototype.fetch.call(this, options);
        },

        transform: function (options) {
            options = options || {};

            if (options.trigger !== true && options.trigger !== false) {
                options.trigger = true;
            }

            this.attributes.title = this.title || '';
            var fields = this.attributes.fields;
            for (var field_name in fields) {
                var field = fields[field_name];

                // Load field name
                if (!field.name) {
                    field.name = field_name;
                }

                // Load field labels if not present
                if (!field.label) {
                    var field_name_components = field_name.split('_');
                    var normalized_field_name_components = [];

                    var index;
                    for (index = 0; index < field_name_components.length; index += 1) {
                        field_name_component = field_name_components[index];
                        normalized_field_name_components.push(
                            Utils.Strings.capitalize(field_name_component)
                        );
                    }

                    field.label = normalized_field_name_components.join(' ');
                }

                // Override fields maximum length with widgets maximum length if present
                if (field.widget && field.widget.attrs && field.widget.attrs.max_length) {
                    field.max_length = field.widget.attrs.max_length;
                }

                // Set field renderer
                if (field.widget) {
                    field.renderer = Templates.Form.Fields[field.widget.title];
                } else {
                    field.renderer = null;
                }
            }

            if (this.allow_buttons && this.buttons.length === 0) {
                this.attributes.buttons = [];
                this.attributes.buttons.push({
                    'class': 'submit',
                    'name': 'submit',
                    'display_text': 'Submit'
                });
            }

            if (!this.attributes.meta) {
                this.attributes.meta = {};
            }

            if (!this.attributes.data) {
                this.attributes.data = {};
            }

            if (!this.attributes.errors) {
                this.attributes.errors = {};
            }

            if (options.trigger) {
                this.trigger('ready');
            }

            this.is_synced = true;
        },

        save: function (options) {
            options = options ? _.clone(options) : {};
            var success = options.success;
            options.success = function(model, resp) {
                // Transform model again on save but don't re-render
                model.transform({trigger: false});
                if (success) {
                    success(model, resp);
                }
            };
            // For backbone save, seconds parameter is considered options if first parameter is null
            Backbone.Model.prototype.save.call(this, null, options);
        },

        is_successfully_synced: function () {
            if (this.is_synced) {
                if (_.keys(this.attributes.errors).length > 0) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        }
    });

    Forms.View = Backbone.View.extend({
        className: 'form_container',

        events: {
            'click input.submit': 'submit',
            'change input': 'update_field_display',
            'change select': 'update_field_display',
            'change textarea': 'update_field_display',
            'focusin label': 'update_field_display',
            'focusout label': 'update_field_display',
            'keypress input': 'submit_on_enter'
        },

        initialize: function (options) {
            Backbone.View.prototype.initialize.call(this, options);
            _.bindAll(
                this,
                'hide_inputs',
                'load_values',
                'render',
                'render_errors',
                'restore_values',
                'save',
                'submit',
                'submit_on_enter',
                'update_field_display',
                'validate',
                'validate_all'
            );

            options = options || {};

            this.is_valid = false;
            this.prefill = options.prefill || false;

            // Use this options to make the form hidden on sumission, effectively allowing the user
            // to submit only once
            this.hide_on_submit = options.hide_on_submit || false;

            // Use this options to reload the page on form submission
            this.reload_on_save = options.reload_on_save || false;

            // Use this option to redirect users to a particular URL upon save
            this.redirect_url = options.redirect_url;

            // Use this option to effectively make the form readonly
            this.editable = options.editable;
            if (this.editable !== true && this.editable !== false) {
                this.editable = true;
            }

            this.spotcheck = options.spotcheck || false;
            this.spotcheck_fields = [];

            // Use this option to disable spotcheck entirely or within code scope
            this.force_disable_spotcheck = false;

            if (!this.model.meta) {
                this.model.meta = {};
            }

            this.model.bind('ready', this.render);
        },

        render: function (options) {
            options = options || {};
            var messages = options.messages || [];
            var field_name, field, map_errors;
            var readonly_fields = [];

            $(this.el).html(Templates.Form.Base({form: this.model.attributes}));
            // Render field
            this.$('.fieldsets').empty();

            for (field_name in this.model.attributes.fields) {
                if (this.model.attributes.fields.hasOwnProperty(field_name)) {
                    field = this.model.attributes.fields[field_name];
                    map_errors = _.indexOf(this.spotcheck_fields, field_name) >= 0;
                    this.$('.fieldsets').append(field.renderer({field: field, map_errors: map_errors}));
                }

                if (!this.editable) {
                    readonly_fields.push(field_name);
                } else if (field.readonly) {
                    readonly_fields.push(field_name);
                }
            }

            // Load messages
            if (messages.length) {
                this.$('.messages-container').html(Templates.Form.Messages({messages: messages}));
            }

            // Unescape labels
            this.$('p.label-text').each(function (index, el) {
                el.innerHTML = $(el).text();
            });

            // Unescape help text
            this.$('p.help').each(function (index, el) {
                el.innerHTML = $(el).text();
            });

            if (this.prefill) {
                this.restore_values();
            }

            this.delegateEvents();

            // Construct readonly fields selector and make them immutable
            var readonly_fields_selector, readonly_fields_selector_param = '', index;

            for (index = 0; index < readonly_fields.length; index += 1) {
                field_name = readonly_fields[index];
                readonly_fields_selector_param += '[for=' + field_name + ']';

                if (index < readonly_fields.length - 1) {
                    readonly_fields_selector_param += ', ';
                }
            }

            if (readonly_fields.length) {
                readonly_fields_selector = this.$(readonly_fields_selector_param).find('input, select, textarea');
                readonly_fields_selector.off();
                readonly_fields_selector.on('click focus mousedown mouseenter', function (event) {
                    event.preventDefault();
                    return false;
                });
                readonly_fields_selector.fadeTo('fast', 0.5);
            }

            return this;
        },

        update_field_display: function (event) {
            if (this.force_disable_spotcheck) {
                return;
            }

            var field, field_name, field_value, form, node_name;
            var event_element = $(event.currentTarget);
            if (event.type === 'focusin') {
                event_element.addClass('is-active');
            } else if (event.type === 'focusout') {
                event_element.removeClass('is-active');
                if (this.spotcheck) {
                    field_name = event_element.attr('for');
                    this.spotcheck_fields = _.union(this.spotcheck_fields, field_name);

                    this.load_values();
                    this.model.attributes.meta.validate = true;
                    form = this;
                    this.model.save({success: function (model, resp) {
                        form.validate();
                        if (!form.prefill) {
                            form.restore_values();
                        }
                    }});
                }
            } else if (event.type === 'change') {
                if (this.spotcheck) {
                    field_name = event_element.parents('[for]').attr('for');

                    // We have to make sure we are dealing with the actual
                    // field name, but because radio buttons share this across
                    // all related input elements, we have to double check for
                    // this because the field_name pulled from the label is
                    // being derived from the input element's "id" attribute,
                    // which is unique.  We use a "|" character to separate the
                    // two values in the ID, so we can easily split it here and
                    // not worry about splitting on a character that might be
                    // used in the field name itself (like a "-" or "_" might
                    // be).
                    field_name = field_name.split('|')[0];

                    field = this.model.attributes.fields[field_name];
                    if (_.indexOf(['checkbox', 'date', 'radio', 'select'], field.widget.input_type) >= 0) {
                        this.spotcheck_fields = _.union(this.spotcheck_fields, field_name);

                        this.load_values();
                        this.model.attributes.meta.validate = true;
                        form = this;
                        this.model.save({success: function (model, resp) {
                            form.validate();
                            if (!form.prefill) {
                                form.restore_values();
                            }
                        }});
                    }
                }
            }
        },

        get_field_value: function (field_name) {
            var field = this.model.attributes.fields[field_name];
            if (field === undefined) {
                return undefined;
            }

            var field_value = '';
            if (_.indexOf(['text', 'password', 'hidden', 'datetime'], field.widget.input_type) >= 0) {
                field_value = this.$('input[name=' + field_name + ']').val();
            } else if (field.widget.input_type === 'select') {
                field_value = this.$('select[name=' + field_name + ']').val();
            } else if (field.widget.input_type === 'date') {
                field_value = this.$('select[name=year]').val();
                field_value += '-' + this.$('select[name=month]').val();
                field_value += '-' + this.$('select[name=day]').val();
            } else if (field.widget.input_type === 'textarea') {
                field_value = this.$('textarea[name=' + field_name + ']').val();
            } else if (field.widget.input_type === 'radio') {
                field_value = this.$('input[name=' + field_name + ']:checked').val();
            } else if (field.widget.input_type === 'checkbox') {
                field_value = this.$('input[name=' + field_name + ']').is(':checked');
            }

            return field_value;
        },

        load_values: function () {
            for (var field_name in this.model.attributes.fields) {
                if (true) {
                    var field_value = this.get_field_value(field_name);

                    if (field_value !== undefined) {
                        this.model.attributes.data[field_name] = field_value;
                    }
                }
            }
        },

        set_field_value: function (field_name, field_value) {
            var field = this.model.attributes.fields[field_name];
            if (field === undefined) {
                return undefined;
            }

            if (_.indexOf(['text', 'password', 'hidden', 'datetime'], field.widget.input_type) >= 0) {
                this.$('input[name=' + field_name + ']').val(field_value);
            } else if (field.widget.input_type === 'select') {
                this.$('select[name=' + field_name + ']').val(field_value);
            } else if (field.widget.input_type === 'date') {
                var date_components = field_value.split('-');
                if (date_components.length !== 3) {
                    return undefined;
                }
                this.$('select[name=year]').val(date_components[0]);
                this.$('select[name=month]').val(date_components[1]);
                this.$('select[name=day]').val(date_components[2]);
            } else if (field.widget.input_type === 'textarea') {
                this.$('textarea[name=' + field_name + ']').val(field_value);
            } else if (field.widget.input_type === 'radio') {
                this.$('input[name=' + field_name + '][value=' + field_value + ']').trigger('click');
            } else if (field.widget.input_type === 'checkbox') {
                this.$('input[name=' + field_name + ']').attr('checked', field_value);
            }
        },

        restore_values: function () {
            this.force_disable_spotcheck = true;
            var field_name, saved_value;
            for (field_name in this.model.attributes.data) {
                if (true) {
                    saved_value = this.model.attributes.data[field_name];

                    if (!saved_value) {
                        continue;
                    }
                    this.set_field_value(field_name, saved_value);
                }
            }
            this.force_disable_spotcheck = false;
        },

        validate: function () {
            this.is_valid = this.model.is_successfully_synced();
            if (!this.valid) {
                this.render_errors();
            }
        },

        validate_all: function () {
            if (_.keys(this.model.attributes.errors).length > 0) {
                this.spotcheck_fields = _.union(
                    _.keys(this.model.attributes.errors),
                    _.keys(this.model.attributes.fields)
                );
            }
            this.validate();
        },

        render_errors: function () {
            // Loop through form errors and insert error message under each field
            // this.model.map_errors();
            var field, field_name, field_container, input_selector;
            var input_tag_types = ['text', 'password', 'radio', 'checkbox'];
            var select_tag_types = ['select', 'date'];

            var non_field_errors = this.model.attributes.non_field_errors || [];
            if (non_field_errors.length) {
                this.$('.non-field-error-container').html(Templates.Form.Errors({
                    errors: non_field_errors
                }));
            } else {
                this.$('.non-field-error-container').empty();
            }

            for (field_name in this.model.attributes.fields) {
                field = this.model.attributes.fields[field_name];

                render_errors = _.indexOf(this.spotcheck_fields, field_name) >= 0;

                if (render_errors) {
                    var field_errors = this.model.attributes.errors[field_name] || [];

                    field_container = this.$('[for=' + field_name + ']');
                    if(field_errors.length) {
                        field_container.find('div.error-container').html(Templates.Form.Errors({errors: field_errors}));
                    } else {
                        field_container.find('div.error-container').empty();
                    }

                    if (_.indexOf(input_tag_types, field.widget.input_type) >= 0) {
                        input_selector = field_container.find('input');
                    } else if (_.indexOf(select_tag_types, field.widget.input_type) >= 0) {
                        input_selector = field_container.find('select');
                    } else if (field.widget.input_type === 'textarea') {
                        input_selector = field_container.find('textarea');
                    }

                    if (field_errors.length) {
                        input_selector.removeClass('valid');
                    } else {
                        input_selector.addClass('valid');
                    }
                }
            }
        },

        submit: function (event) {
            this.$el.fadeTo('fast', 0.5);

            this.load_values();
            this.model.attributes.meta.validate = false;

            var form = this;
            this.model.save({success: function (model, resp) {
                // Validate all fields on submission
                form.validate_all();
                if (form.is_valid) {
                    form.save();
                } else {
                    form.$el.fadeTo('fast', 1.0);
                }
            }});

            if (this.hide_on_submit) {
                this.hide_inputs();
            }
        },

        submit_on_enter: function (event) {
            if (event.keyCode !== 13) {
                return;
            }

            event.preventDefault();
            this.submit(event);
        },

        hide_inputs: function () {
            this.$('.fieldsets').hide();
            this.$('.buttons-container').hide();
        },

        save: function () {
            var submit_buttons = _.filter(this.model.buttons, function (button) {
                return button['class'] === 'submit';
            });

            if (submit_buttons.length) {
                var submit_button = submit_buttons[0];
                if (submit_button.message) {
                    this.$('.messages-container').html(Templates.Form.Messages({
                        messages: [submit_button.message]
                    }));
                }
            }

            if (this.redirect_url) {
                window.location.replace(this.redirect_url);
                // window.location.reload(true);
            } else if (this.reload_on_save) {
                window.location.replace(window.location.href.split('#')[0]);
            } else {
                this.$el.fadeTo('fast', 1.0);
            }
        }
    });

    Forms.DjangoModelInstance = Forms.Model.extend({
        initialize: function (options) {
            Forms.Model.prototype.initialize.call(this, options);

            options = options ? _.clone(options) : {};

            this.app_label = options.app_label;
            this.model_name = options.model_name;
            this.instance_id = options.instance_id;
        },

        url: function () {
            var url = '/adminapi/apps/' + this.app_label + '/models/' + this.model_name + '/instances';
            if (this.instance_id) {
                url += '/' + this.instance_id;
            }

            url += '/form/';
            return url;
        }
    });

    Forms.Login = Forms.Model.extend({
        url: '/adminapi/login/'
    });

    return Forms;
});
