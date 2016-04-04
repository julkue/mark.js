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
    });

    // read copyright header
    var fc = grunt.file.read("src/jquery.mark.js");
    var regex = /\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//gmi;
    var banner = fc.match(regex)[0];

    // configuration
    grunt.initConfig({
        babel: {
            options: {
                presets: ["es2015"],
                plugins: ["transform-object-assign"],
                compact: true,
                comments: false
            },
            es5: {
                files: {
                    "dist/jquery.mark.min.js": "src/jquery.mark.js"
                }
            },
            es6: {
                options: {
                    presets: [],
                    plugins: []
                },
                files: {
                    "dist/jquery.mark.es6.min.js": "src/jquery.mark.js"
                }
            },
            build: {
                options: {
                    compact: false
                },
                files: {
                    "build/jquery.mark.js": "src/jquery.mark.js"
                }
            }
        },
        clean: {
            build: ["build/jquery.mark.js"]
        },
        jsdoc: {
            dist: {
                src: ["src/jquery.mark.js", "README.md"],
                options: {
                    destination: "build/doc"
                }
            }
        },
        karma: {
            options: {
                configFile: "karma.conf.js" // shared config
            },
            build: {},
            buildsl: {
                configFile: "karma.conf-ci.js"
            },
            dev: {
                singleRun: false,
                autoWatch: true,
                background: true
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
                tasks: ["babel:build", "karma:dev:run", "clean:build"]
            }
        }
    });

    // register tasks
    grunt.log.writeln(banner["yellow"]);
    grunt.registerTask("dev", ["karma:dev:start", "watch"]);
    grunt.registerTask("test", function () {
        grunt.log.subhead(
            "See the table below for test coverage or view 'build/coverage/'"
        );
        // local test against an uncompressed ES5 variant as ES6 is not
        // supported in PhantomJS and the normal ES5 variant is already
        // compressed (bad to determine coverage issues)
        grunt.task.run(["babel:build"]);
        // continuous integration cross browser test
        if(process.env.CI) {
            if(process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
                grunt.task.run(["karma:buildsl"]);
            } else {
                grunt.log.warn(
                    "Make sure SAUCE_USERNAME and SAUCE_ACCESS_KEY " +
                    "environment variables are set."
                );
            }
        } else {
            grunt.task.run(["karma:build"]);
        }
        grunt.task.run(["clean:build"]);
    });
    grunt.registerTask("minify", [
        "babel:es5",
        "babel:es6",
        "uglify",
        "usebanner"
    ]);
    grunt.registerTask("dist", ["test", "minify", "jsdoc"]);
};
