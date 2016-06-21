/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
module.exports = config => {
    // Define Sauce Labs browsers
    var customLaunchers = {
        "SL_Win_Chrome_30": {
            base: "SauceLabs",
            browserName: "chrome",
            platform: "Windows 10",
            version: "30"
        },
        "SL_Win_Chrome_40": {
            base: "SauceLabs",
            browserName: "chrome",
            platform: "Windows 10",
            version: "40"
        },
        "SL_Win_Chrome_50": {
            base: "SauceLabs",
            browserName: "chrome",
            platform: "Windows 10",
            version: "50"
        },
        "SL_Win_Chrome_Latest": {
            base: "SauceLabs",
            browserName: "chrome",
            platform: "Windows 10",
            version: "latest"
        },
        "SL_Win_Firefox_30": {
            base: "SauceLabs",
            browserName: "firefox",
            platform: "Windows 10",
            version: "30"
        },
        "SL_Win_Firefox_40": {
            base: "SauceLabs",
            browserName: "firefox",
            platform: "Windows 10",
            version: "40"
        },
        "SL_Win_Firefox_Latest": {
            base: "SauceLabs",
            browserName: "firefox",
            platform: "Windows 10",
            version: "latest"
        },
        "SL_Win_Opera_Latest": {
            base: "SauceLabs",
            browserName: "opera",
            platform: "Windows 7",
            version: "latest"
        },
        "SL_Win_Safari_5": {
            base: "SauceLabs",
            browserName: "safari",
            platform: "Windows 7",
            version: "5.1"
        },
        "SL_OSX_Safari_6": {
            base: "SauceLabs",
            browserName: "safari",
            platform: "OS X 10.8",
            version: "6"
        },
        "SL_OSX_Safari_9": {
            base: "SauceLabs",
            browserName: "safari",
            platform: "OS X 10.11",
            version: "9"
        },
        "SL_Win_IE_9": {
            base: "SauceLabs",
            browserName: "internet explorer",
            platform: "Windows 7",
            version: "9"
        },
        "SL_Win_IE_10": {
            base: "SauceLabs",
            browserName: "internet explorer",
            platform: "Windows 7",
            version: "10"
        },
        "SL_Win_IE_11": {
            base: "SauceLabs",
            browserName: "internet explorer",
            platform: "Windows 7",
            version: "11"
        },
        "SL_Win_Edge_Latest": {
            base: "SauceLabs",
            browserName: "microsoftedge",
            platform: "Windows 10",
            version: "latest"
        },
        "SL_iOS_9": {
            base: "SauceLabs",
            browserName: "iphone",
            platform: "OS X 10.10",
            version: "9.2"
        },
        "SL_iOS_8": {
            base: "SauceLabs",
            browserName: "iphone",
            platform: "OS X 10.10",
            version: "8.0"
        },
        "SL_Android_4": {
            base: "SauceLabs",
            browserName: "android",
            platform: "Linux",
            version: "4.4"
        },
        "SL_Android_5": {
            base: "SauceLabs",
            browserName: "android",
            platform: "Linux",
            version: "5.1"
        }
    };
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
            "karma-sauce-launcher",
            "karma-coverage"
        ],
        sauceLabs: {
            testName: "mark.js unit tests"
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        reporters: ["spec", "saucelabs", "coverage"],
        // in case Sauce Labs is slow
        captureTimeout: 180000, // 3 min
        browserDisconnectTimeout: 60000, // 1 min
        browserNoActivityTimeout: 60000, // 1 min
        browserDisconnectTolerance: 15,
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
