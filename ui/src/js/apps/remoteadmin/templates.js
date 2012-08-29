define(function (require){
    return {
        Errors: require('hbs!./templates/errors'),
        Form: require('hbs!./templates/form'),

        // Fields
        Fields: {
            Button: require('hbs!./templates/fields/button'),
            CheckBoxInput: require('hbs!./templates/fields/checkbox_input'),
            DateInput: require('hbs!./templates/fields/date_input'),
            FileInput: require('hbs!./templates/fields/file_input'),
            HiddenInput: require('hbs!./templates/fields/hidden_input'),
            ImageInput: require('hbs!./templates/fields/image_input'),
            PasswordInput: require('hbs!./templates/fields/password_input'),
            RadioSelect: require('hbs!./templates/fields/radio_select'),
            Select: require('hbs!./templates/fields/select'),
            TextInput: require('hbs!./templates/fields/text_input'),
            Textarea: require('hbs!./templates/fields/textarea')
        }
    };
});