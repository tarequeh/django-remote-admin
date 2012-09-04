define(function (require) {
    var Models = require('./models'),
        Views = require('./views'),
        Forms = require('./forms'),
        Routers = require('./routers'),
        Templates = require('./templates'),
        Utils = require('./utils');

    return {
        init: function() {
            // Initialize router
            var remoteadmin_router = new Routers.RemoteAdmin();

            $(document).ajaxError(function(e, xhr, settings, exception) {
                if (xhr.status < 400) {
                    // Ignore non 200 codes that don't indicate errors
                    return false;
                } else if (xhr.status === 401) {
                    window.location.hash = '#/login/';
                }
            });
        },
        Models: Models,
        Views: Views,
        Forms: Forms,
        Routers: Routers,
        Templates: Templates,
        Utils: Utils
    };
});
