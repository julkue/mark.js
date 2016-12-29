/*!*****************************************************
 * mark.js-website
 * https://github.com/julmot/mark.js/tree/website
 * Copyright (c) 2016–2017, Julian Motz
 * All Rights Reserved
 *******************************************************/
(function (global) {
    // app dependency configuration and initializaton with requirejs
    require.config({
        baseUrl: "src/app",
        paths: {
            // internal
            "app": "app",
            "configurator": "configurator",

            // external
            "jquery": "../../vendor/jquery/dist/jquery.min",
            "bootstrap": "../../vendor/bootswatch-dist/js/bootstrap.min",
            "highlightjs": "../../vendor/highlightjs/highlight.pack.min",
            "fastclick": "../../vendor/fastclick/lib/fastclick",
            "markjs": "../../vendor/mark.js/dist/jquery.mark.min"
        },
        shim: {
            "bootstrap": {
                "deps": ["jquery"]
            }
        },
        deps: [
            "fastclick", "app", "configurator"
        ],
        waitSeconds: 60 // necessary for 2G
    });
})(this);
