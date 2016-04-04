/*!***************************************************
 * jquery.mark
 * https://github.com/julmot/jquery.mark
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vaizN
 *****************************************************/
module.exports = function (config) {
    config.set({
        basePath: "",
        frameworks: ["jasmine-jquery", "jasmine"],
        files: [
            "vendor/jquery/dist/jquery.min.js",
            "build/jquery.mark.js",
            "src/*.spec.js", {
                pattern: "test/fixtures/*.html",
                included: false,
                served: true
            }
        ],
        exclude: [],
        reporters: ["spec", "coverage"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        plugins: [
            "karma-jasmine",
            "karma-jasmine-jquery",
            "karma-phantomjs-launcher",
            "karma-spec-reporter",
            "karma-coverage"
        ],
        browsers: ["PhantomJS"],
        captureTimeout: 30000,
        browserNoActivityTimeout: 60000, // 60 sec
        singleRun: true,
        preprocessors: {
            "build/jquery.mark.js": ["coverage"]
        },
        coverageReporter: {
            dir: "build/coverage/",
            reporters: [{
                type: "html"
            }, {
                type: "text"
            }]
        }
    });
};
