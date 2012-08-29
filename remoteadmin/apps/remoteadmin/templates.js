define(function (require){
    return {
        Errors: require('hbs!./templates/errors'),
        Form: require('hbs!./templates/form'),

        // Fields
        Fields: {
            Button: require('hbs!./templates/button'),
            CheckBoxInput: require('hbs!./templates/checkbox_input'),
            DateInput: require('hbs!./templates/date_input'),
            FileInput: require('hbs!./templates/file_input'),
            HiddenInput: require('hbs!./templates/hidden_input'),
            ImageInput: require('hbs!./templates/image_input'),
            PasswordInput: require('hbs!./templates/password_input'),
            RadioSelect: require('hbs!./templates/radio_select'),
            Select: require('hbs!./templates/select'),
            TextInput: require('hbs!./templates/text_input'),
            Textarea: require('hbs!./templates/textarea')
        }
    };
});