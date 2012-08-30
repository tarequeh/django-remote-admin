define(function (require){
    return {
        AppModels: require('hbs!./templates/app_models'),
        Form: {
            Errors: require('hbs!./templates/form/errors'),
            Base: require('hbs!./templates/form/base'),

            // Fields
            Fields: {
                Button: require('hbs!./templates/form/fields/button'),
                CheckBoxInput: require('hbs!./templates/form/fields/checkbox_input'),
                DateInput: require('hbs!./templates/form/fields/date_input'),
                FileInput: require('hbs!./templates/form/fields/file_input'),
                HiddenInput: require('hbs!./templates/form/fields/hidden_input'),
                ImageInput: require('hbs!./templates/form/fields/image_input'),
                PasswordInput: require('hbs!./templates/form/fields/password_input'),
                RadioSelect: require('hbs!./templates/form/fields/radio_select'),
                Select: require('hbs!./templates/form/fields/select'),
                TextInput: require('hbs!./templates/form/fields/text_input'),
                Textarea: require('hbs!./templates/form/fields/textarea')
            }
        }
    };
});