define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Utils = {};

    Utils.Strings = {};

    Utils.Strings.capitalize = function (input_string) {
        return input_string.charAt(0).toUpperCase() + input_string.slice(1);
    };

    return Utils;
});
