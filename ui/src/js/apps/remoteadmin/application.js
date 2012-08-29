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
        },
        Models: Models,
        Views: Views,
        Forms: Forms,
        Routers: Routers,
        Templates: Templates,
        Utils: Utils
    };
});
