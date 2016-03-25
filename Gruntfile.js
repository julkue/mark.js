/*!***************************************************
 * jquery.mark
 * https://github.com/julmot/jquery.mark
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vaizN
 *****************************************************/
module.exports = function (grunt) {
    // load grunt tasks
    require("jit-grunt")(grunt, {
        usebanner: "grunt-banner"
    })

    // read copyright header
    var fc = grunt.file.read("src/jquery.mark.js");
    var regex = /\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//gmi;
    var banner = fc.match(regex)[0];

    // configuration
    grunt.initConfig({
        babel: {
            options: {
                compact: true,
                comments: false
            },
            es5: {
                options: {
                    presets: ["es2015"],
                    plugins: ["transform-object-assign"]
                },
                files: {
                    "dist/jquery.mark.min.js": "src/jquery.mark.js"
                }
            },
            es6: {
                files: {
                    "dist/jquery.mark.es6.min.js": "src/jquery.mark.js"
                }
            }
        },
        karma: {
            options: {
                configFile: "karma.conf.js" // shared config
            },
            dist: {},
            dev: {
                singleRun: false,
                autoWatch: true,
                background: true
            },
            saucelabs: {
                configFile: "karma.conf-ci.js"
            }
        },
        uglify: {
            dist: {
                options: {
                    screwIE8: true,
                    compress: true,
                    reserveComments: false
                },
                files: {
                    "dist/jquery.mark.min.js": "dist/jquery.mark.min.js"
                }
            }
        },
        usebanner: {
            dist: {
                options: {
                    position: "top",
                    banner: banner,
                    linebreak: true
                },
                files: {
                    // don"t include subfolders
                    src: ["dist/*.js", "!dist/*/*.js"]
                }
            }
        },
        watch: {
            dist: {
                files: ["src/*", "test/*"],
                tasks: ["minify", "karma:dev:run"]
            }
        }
    });

    // register tasks
    grunt.log.writeln(banner["yellow"]);
    grunt.registerTask("dev", ["karma:dev:start", "watch"]);
    grunt.registerTask("test", function () {
        // minify first, as es5 version will be tested
        grunt.task.run(["minify", "karma:dist"]);
        // continuous integration
        if(process.env.CI) {
            if(process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
                grunt.task.run(["karma:saucelabs"]);
            } else {
                grunt.log.warn(
                    "Make sure SAUCE_USERNAME and SAUCE_ACCESS_KEY " +
                    "environment variables are set."
                );
            }
        }
    });
    grunt.registerTask("minify", ["babel", "uglify", "usebanner"]);
    grunt.registerTask("dist", ["test"]);
    // there may be a time where ES6 is supported in PhantomJS, then
    // there will no "minify" necessary in "test". If so there would be
    // no option to generate ".min.js" files, so let's keep it here even if it
    // is not necessary at the moment.
};
