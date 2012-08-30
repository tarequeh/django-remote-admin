require.config({
    // baseUrl: "/static/js",

    // hbs config
    hbs: {
        disableI18n: true,
        disableHelpers: true
    },

    paths: {
        // Require Handlebars-plugin
        'hbs':              '../../lib/js/require-handlebars-plugin/0.2.1/hbs',
        'Handlebars':       '../../lib/js/require-handlebars-plugin/0.2.1/Handlebars',

        // Core
        'backbone':         '../../lib/js/backbone/0.9.1/backbone',
        'jquery':           '../../lib/js/jquery/1.7.2/jquery',
        'json2':            '../../lib/js/json2/2010.03.20/json2',
        'underscore':       '../../lib/js/underscore/1.3.1/underscore'
    },

    pragmasOnSave: {
        excludeHbsParser : true,
        excludeHbs: true,
        excludeAfterBuild: true
    },

    shim: {
        'backbone': {
            deps:       ['jquery', 'underscore'],
            exports:    'Backbone'
        },
        'backbone.layoutmanager':   ['backbone'],
        'json2': {
            exports: 'JSON'
        },
        'underscore': {
            exports: '_'
        }
    },

    waitSeconds: 30
});

require(
    [
        'require',
        'backbone',
        'apps/remoteadmin/application'
    ],
    function (require, Backbone, remote_admin_app) {
        // Apply backbone settings here in a central location
        Backbone.emulateHTTP = true;
        Backbone.emulateJSON = true;

        remote_admin_app.init();

        // Start backbone history once, here in a central location
        Backbone.history.start();
    }
);
