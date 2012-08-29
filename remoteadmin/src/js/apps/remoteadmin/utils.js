define(function (require) {
    var Utils = {
        Strings: {}
    };

    Utils.Strings.capitalize = function (input_string) {
        return input_string.charAt(0).toUpperCase() + input_string.slice(1);
    };

    return Utils;
});
