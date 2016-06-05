/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
module.exports = config => {
    config.set({
        basePath: "",
        frameworks: ["jasmine-jquery", "jasmine"],
        files: [
            "vendor/jquery/dist/jquery.min.js",
            "dist/!(*.es6|*.min).js",
            "test/specs/configuration.js",
            "test/specs/basic-done.js",
            "test/specs/basic-each.js",
            "test/specs/basic-no-match.js",
            "test/specs/basic-debug.js",
            "test/specs/basic.js",
            "test/specs/basic-unmark.js",
            "test/specs/basic-array.js",
            "test/specs/basic-nodelist.js",
            "test/specs/basic-array-keyword.js",
            "test/specs/basic-!(accuracy)*.js",
            // depends on diacritics, separateWordSearch
            "test/specs/basic-accuracy*.js",
            "test/specs/iframes.js",
            "test/specs/iframes-unmark.js",
            "test/specs/*.js", {
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
        failOnEmptyTestSuite: false,
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
            "dist/mark.js": ["coverage"]
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
