/*!*****************************************************
 * mark.js-website
 * https://github.com/julmot/mark.js/tree/website
 * Copyright (c) 2016–2017, Julian Motz
 * All Rights Reserved
 *******************************************************/
(function (global) {
    define([
        "jquery",
        "bootstrap",
        "markjs"
    ], function ($) {
        "use strict";
        $(function () {

            /**
             * Cache DOM elements to prevent much DOM parsing
             */
            var $body = $("body"),
                $configurator = $(".configurator"),
                $typeToggles = $configurator.find("input[name='type']"),
                $forms = $configurator.find("form"),
                $markContext = $configurator.find(".context"),
                $codeExample = $configurator.find(".code-example"),
                $codeExampleMethod = $codeExample.find(".method"),
                $codeExampleValue = $codeExample.find(".value"),
                $codeExampleOptions = $codeExample.find(".options"),
                $codeExampleDelimiter = $codeExample.find(".delimiter");

            /**
             * Selectors
             */
            var synonymsSel = ".configurator .synonyms";
            var synonymsBtnSel = synonymsSel + " button";
            var excludeSel = ".configurator .exclude";
            var excludeBtnSel = excludeSel + " button";

            /**
             * Returns the current type, "keyword", "array" or "regexp"
             * @return {string}
             */
            function getCurrentType() {
                return $typeToggles.filter(":checked").val();
            }

            /**
             * Returns the current form based on the current type
             * @return {jQuery}
             */
            function getCurrentForm() {
                var type = getCurrentType();
                return $forms.filter("[name='form-" + type + "']");
            }

            /**
             * Returns the specified keyword, array of keyword or custom regular
             * expression
             * @return {string}
             */
            function getSearchValue() {
                var sel = "input[name='" + getCurrentType() + "']";
                return getCurrentForm().find(sel).val().trim();
            }

            /**
             * Returns the serialized form as array. Input elements will be
             * filtered by type constraints
             * @return {array}
             */
            function getSerializedForm() {
                var $form = getCurrentForm();
                return $form
                    .find("input, select")
                    .not("[name='keyword'], [name='array'], [name='regexp']")
                    .not("[name='type'], [name='exclude[]']")
                    .not("[name='ignoreGroups']")
                    .serializeArray()
                    .concat(
                        $form.find("input[type='checkbox']")
                        .filter(":not(:checked)")
                        .map(
                            function () {
                                return {
                                    "name": this.name,
                                    "value": "off"
                                }
                            }
                        ).get()
                    );
            }

            /**
             * Returns the specified options
             * @return {object} options
             */
            function getOptions() {
                var options = {
                        "synonyms": {},
                        "exclude": []
                    },
                    inputValues = getSerializedForm();
                // Set option values
                $.each(inputValues, function (i, input) {
                    var name = input.name;
                    var value = input.value;
                    if(value === "on") {
                        value = true;
                    } else if(value === "off") {
                        value = false;
                    } else if(!value) {
                        return;
                    }
                    options[name] = value;
                });
                // Map correct synonyms
                $.each(options, function (key, value) {
                    if(key.indexOf("synonym") > -1 && key.indexOf("key") > -1) {
                        var spl = key.split("_");
                        var valueName = spl[0] + "_" + spl[1] + "_value";
                        if(options[valueName] && value) {
                            options["synonyms"][value] = options[valueName];
                        }
                        delete options[key];
                        delete options[valueName];
                    }
                });
                if($.isEmptyObject(options["synonyms"])) {
                    delete options["synonyms"];
                }
                // Map correct exclude values
                getCurrentForm().find("[name='exclude[]']").each(function () {
                    var val = $(this).val().trim();
                    if(val) {
                        options["exclude"].push(val);
                    }
                });
                var $iGroups = getCurrentForm().find("[name='ignoreGroups']");
                options["ignoreGroups"] = parseInt($iGroups.val()) || 0;
                return options;
            }

            /**
             * Compares the given object against the default options and returns
             * the difference
             * @param  {object} option
             * @return {object}
             */
            function getNonDefaultOptions(options) {
                var ret = {},
                    defaults = {
                        "element": "mark",
                        "className": "",
                        "exclude": [],
                        "iframes": false,
                        "separateWordSearch": true,
                        "diacritics": true,
                        "synonyms": {},
                        "accuracy": "partially",
                        "acrossElements": false,
                        "caseSensitive": false,
                        "ignoreJoiners": false,
                        "ignoreGroups": 0,
                        "wildcards": "disabled",
                        "debug": false
                    };
                for(var opt in options) {
                    if(options.hasOwnProperty(opt)) {
                        var a = JSON.stringify(options[opt]);
                        var b = JSON.stringify(defaults[opt]);
                        if(a != b) {
                            ret[opt] = options[opt];
                        }
                    }
                }
                return ret;
            }

            /**
             * Updates the live code example
             * @param {string} method
             * @param  {string} searchTerm
             * @param  {object} options
             */
            function updateCodeExample(method, searchTerm, options) {
                $codeExampleMethod.text(method);
                $codeExampleValue.text(searchTerm);
                if(!$.isEmptyObject(options)) {
                    var optVal = JSON.stringify(options, null, 4);
                } else {
                    var optVal = "";
                }
                $codeExampleOptions.text(optVal);
                if(optVal) {
                    $codeExampleDelimiter.show();
                } else {
                    $codeExampleDelimiter.hide();
                }
            }

            /**
             * Converts the search value in its respectively format, e.g. array
             * or RegExp
             * @param {string} val
             * @param {string} type
             * @return {string|string[]|RegExp}
             */
            function serializeSearchValue(val, type) {
                switch(type) {
                case "keyword":
                default:
                    return val;
                case "array":
                    return eval(val);
                case "regexp":
                    var match = val.match(new RegExp("^/(.*?)/([gimy]*)$"));
                    return new RegExp(match[1], match[2]);
                }
            }

            /**
             * Initializes mark.js and updates the code example with the
             * specified form values
             */
            function runConfigurator() {
                var type = getCurrentType();
                var term = getSearchValue();
                var options = getNonDefaultOptions(getOptions());
                var method = type === "regexp" ? "markRegExp" : "mark";
                try {
                    var serialize = serializeSearchValue(term, type);
                } catch(e) {
                    return;
                }
                $markContext.unmark();
                try {
                    $markContext[method](serialize, options);
                } catch(e) {
                    // this can be thrown when e.g. the exclude selector is "."
                    console.debug(e);
                }
                if(typeof serialize === "string") {
                    term = '"' + term + '"';
                } else if(Array.isArray(serialize)) {
                    term = '["' + serialize.join('", "') + '"]';
                } else {
                    term = serialize.toString();
                }
                updateCodeExample(method, term, options);
            }

            /**
             * Toggles forms based on checked/unchecked type toggles
             */
            function initFormToggle() {
                // it is necessary to trigger the action on init as the
                // checkboxes may persist checked after page load
                $typeToggles.on("change.typeToggle", function () {
                    $forms.hide();
                    getCurrentForm().show();
                }).trigger("change.typeToggle");
            }

            /**
             * Makes sure that elements will be validated
             */
            function initFormValidation() {
                // Since the form will be validated by the browser using the
                // pattern attribute, it is only necessary to stop the redirect
                // action when the form is valid
                $forms.on("submit", function (event) {
                    if(this.checkValidity()) {
                        event.preventDefault();
                    }
                });
            }

            /**
             * Initializes dynamic synonym addition/deletion
             */
            function initDynamicSynonyms() {
                var counter = 1;
                $body.on("click", synonymsBtnSel, function () {
                    var $this = $(this);
                    var $closest = $this.closest(synonymsSel);
                    if($this.find("[data-action='add']").is(":visible")) {
                        ++counter;
                        var $clone = $closest.clone();
                        var $inputs = $clone.find("input[name^='synonym']");
                        $inputs.each(function () {
                            var $this = $(this);
                            var newAttr = $this.attr("name").replace(
                                /(synonym_)[^\_]*(_[^]*)/,
                                "$1" + counter + "$2"
                            );
                            $this.attr("name", newAttr);
                        });
                        $clone.find("[data-action='add']").hide();
                        $clone.find("[data-action='remove']").show();
                        $clone.insertAfter($closest);
                    } else {
                        $closest.remove();
                    }
                });
            }

            /**
             * Initializes dynamic exclude addition/deletion
             */
            function initDynamicExclude() {
                $body.on("click", excludeBtnSel, function () {
                    var $this = $(this);
                    var $closest = $this.closest(excludeSel);
                    if($this.find("[data-action='add']").is(":visible")) {
                        var $clone = $closest.clone();
                        $clone.find("[data-action='add']").hide();
                        $clone.find("[data-action='remove']").show();
                        $clone.insertAfter($closest);
                    } else {
                        $closest.remove();
                    }
                });
            }

            /**
             * Initializes configurator events
             */
            function initConfigurator() {
                $forms.on("submit", function () {
                    runConfigurator();
                });
                // make sure e.g. the could example is set on initialization
                runConfigurator();
            }

            /**
             * Initializes configurator events
             */
            function initEvents() {
                if($configurator.length) {
                    initFormToggle();
                    initDynamicSynonyms();
                    initDynamicExclude();
                    initFormValidation();
                    initConfigurator();
                }
            }

            return initEvents();

        });
    });
})(this);
