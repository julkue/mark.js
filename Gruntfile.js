/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
module.exports = grunt => {

    // load grunt tasks
    require("jit-grunt")(grunt, {
        usebanner: "grunt-banner"
    });

    // settings
    const mainFile = "mark.js";

    // read copyright header
    let fc = grunt.file.read(`src/${mainFile}`);
    let regex = /\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//gmi;
    const banner = fc.match(regex)[0];
    grunt.log.writeln(banner["yellow"]);

    // grunt configuration
    grunt.initConfig({
        babel: {
            options: {
                compact: false,
                comments: false
            },
            es5: {
                options: {
                    presets: ["es2015"],
                    plugins: ["transform-object-assign"]
                },
                files: [{
                    "expand": true,
                    "cwd": "build/",
                    "src": ["*.js"],
                    "dest": "dist/"
                }]
            },
            es6: {
                files: [{
                    "expand": true,
                    "cwd": "build/",
                    "src": ["*.js"],
                    "dest": "dist/",
                    "ext": ".es6.js",
                    "extDot": "last"
                }]
            },
            // as uglify can not compress es6, use the babel workaround
            es6min: {
                options: {
                    compact: true
                },
                files: [{
                    "expand": true,
                    "cwd": "dist/",
                    "src": ["*.es6.js"],
                    "dest": "dist/",
                    "ext": ".min.js",
                    "extDot": "last"
                }]
            }
        },
        clean: {
            build: ["build/*.js"],
            dist: ["dist/*.js"]
        },
        eslint: {
            options: {
                configFile: ".eslintrc"
            },
            target: ["src/**/*.js", "test/**/*.js"]
        },
        jsdoc: {
            dist: {
                src: [`src/${mainFile}`, "README.md"],
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
                files: [{
                    "expand": true,
                    "cwd": "dist/",
                    "src": ["*.js", "!*.es6.js", "!*.es6.min.js"],
                    "dest": "dist/",
                    "ext": ".min.js",
                    "extDot": "last"
                }]
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
                    src: ["dist/*.js"]
                }
            }
        },
        watch: {
            dist: {
                files: ["src/**", "test/**", "build/templates/**"],
                tasks: ["compile", "karma:dev:run"]
            }
        }
    });

    /**
     * Compile build templates and generate all of them in ES5, ES6, with
     * minification and without into ./dist
     */
    grunt.registerTask("compile", () => {
        grunt.template.addDelimiters("jsBuildDelimiters", "//<%", "%>");
        grunt.file.expand("build/templates/*.js").forEach(file => {
            const filename = file.replace(/^.*[\\\/]/, "");
            const tpl = grunt.file.read(file);
            const module = grunt.file.read(`src/${mainFile}`);
            const compiled = grunt.template.process(tpl, {
                "delimiters": "jsBuildDelimiters",
                "data": {
                    "module": module
                }
            });
            grunt.file.write(`build/${filename}`, compiled);
        });
        grunt.task.run([
            "clean:dist", "babel", "uglify", "usebanner", "clean:build"
        ]);
    });

    /**
     * Run tests on file changes
     */
    grunt.registerTask("dev", ["karma:dev:start", "watch"]);

    /**
     * Run lint
     */
    grunt.registerTask("lint", function () {
        grunt.task.run(["eslint"]);
    });

    /**
     * Run tests
     */
    grunt.registerTask("test", function () {
        grunt.log.subhead(
            "See the table below for test coverage or view 'build/coverage/'"
        );
        grunt.task.run(["compile", "lint"]);
        // continuous integration cross browser test
        if(process.env.CI) {
            if(process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
                grunt.task.run(["karma:buildsl"]);
                return;
            } else {
                if(process.env.TRAVIS_PULL_REQUEST !== "false") {
                    grunt.log.warn(
                        "Make sure SAUCE_USERNAME and SAUCE_ACCESS_KEY " +
                        "environment variables are set."
                    );
                }
            }
        }
        grunt.task.run(["karma:build"]);
    });

    /**
     * Run tests, generate dist files and JSDOC documentation
     */
    grunt.registerTask("dist", ["test", "jsdoc"]);
};
