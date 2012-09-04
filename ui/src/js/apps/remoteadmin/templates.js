define(function (require){
    return {
        Login: require('hbs!./templates/login'),
        AppModels: require('hbs!./templates/app_models'),
        ModelInstance: require('hbs!./templates/model_instance'),
        ModelInstances: require('hbs!./templates/model_instances'),

        Form: {
            Errors: require('hbs!./templates/form/errors'),
            Base: require('hbs!./templates/form/base'),
            Messages: require('hbs!./templates/form/messages'),

            // Fields
            Fields: {
                Button: require('hbs!./templates/form/fields/button'),
                CheckboxInput: require('hbs!./templates/form/fields/checkbox_input'),
                DateInput: require('hbs!./templates/form/fields/date_input'),
                DateTimeInput: require('hbs!./templates/form/fields/date_time_input'),
                FileInput: require('hbs!./templates/form/fields/file_input'),
                HiddenInput: require('hbs!./templates/form/fields/hidden_input'),
                ImageInput: require('hbs!./templates/form/fields/image_input'),
                PasswordInput: require('hbs!./templates/form/fields/password_input'),
                RadioSelect: require('hbs!./templates/form/fields/radio_select'),
                Select: require('hbs!./templates/form/fields/select'),
                SelectMultiple: require('hbs!./templates/form/fields/select_multiple'),
                TextInput: require('hbs!./templates/form/fields/text_input'),
                Textarea: require('hbs!./templates/form/fields/textarea')
            }
        }
    };
});