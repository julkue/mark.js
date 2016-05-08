/*!*****************************************************
 * mark.js-website
 * https://github.com/julmot/mark.js/tree/website
 * Copyright (c) 2016, Julian Motz. All Rights Reserved.
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

                $form = $configurator.find("form"),
                $checkboxes = $form.find("input[type='checkbox']"),
                $radioButtons = $form.find("input[type='radio']"),
                $selects = $form.find("select"),
                $typeRadioButtons = $radioButtons.filter("[name='type']"),
                $textInputs = $form.find("input[type='text']"),
                $performButton = $form.find("button#perform"),
                $synonyms = $form.find(".synonyms"),
                $filters = $form.find(".filters"),
                $types = $form.find("[data-type-constraint]"),

                $context = $configurator.find(".context"),

                $codeExample = $configurator.find(".code-example"),
                $codeExampleMethod = $codeExample.find(".method"),
                $codeExampleValue = $codeExample.find(".value"),
                $codeExampleOptions = $codeExample.find(".options"),
                $codeExampleDelimiter = $codeExample.find(".delimiter");

            /**
             * Returns the current type, "keyword", "array" or "regexp"
             * @return {string}
             */
            function getCurrentType() {
                return $typeRadioButtons.filter(":checked").val();
            }

            /**
             * Returns the specified keyword, array of keyword or custom regular
             * expression
             * @return {string}
             */
            function getSearchValue() {
                var val = getCurrentType();
                return $textInputs.filter("[name='" + val + "']").val().trim();
            }

            /**
             * Returns the serialized form as array. Input elements will be
             * filtered by type constraints
             * @return {array}
             */
            function getSerializedForm() {
                var type = getCurrentType(),
                    notChk = function () {
                        var attr = "data-type-constraint";
                        var $p = $(this).parents("[" + attr + "]");
                        if($p.length && $p.attr(attr).indexOf(type) === -1) {
                            return true;
                        }
                        return false;
                    };
                return $form
                    .find("input, select")
                    .not("[name='keyword'], [name='array'], [name='regexp']")
                    .not("[name='type'], [name='filter[]']")
                    .not(notChk)
                    .serializeArray()
                    .concat(
                        $checkboxes
                        .not(notChk)
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
                        "filter": []
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
                // Map correct filter values
                $form.find("[name='filter[]']").each(function () {
                    var val = $(this).val().trim();
                    if(val) {
                        options["filter"].push(val);
                    }
                });
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
                        "filter": [],
                        "iframes": false,
                        "separateWordSearch": true,
                        "diacritics": true,
                        "synonyms": {},
                        "accuracy": "partially",
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
                    if(val.charAt(0) === "[") {
                        val = val.substr(1);
                    }
                    if(val.slice(-1) === "]") {
                        val = val.substring(0, val.length - 1);
                    }
                    val = val.replace(/[\s]*\"/g, "").replace(/\"/g, "");
                    return val.split(",");
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
                $context.unmark();
                try {
                    $context[method](serialize, options);
                } catch(e) {
                    // this can be thrown when e.g. the filter selector is "."
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
             * Initializes dynamic synonym addition/deletion
             * @param  {function} onDelete Callback if a synonym was deleted
             */
            function initDynamicSynonyms(onDelete) {
                var counter = 1;
                $body.on("click", $synonyms.selector + " button", function () {
                    var $this = $(this);
                    if($this.find("[data-action='add']").is(":visible")) {
                        ++counter;
                        var $clone = $synonyms.clone();
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
                        $clone.insertAfter($synonyms);
                    } else {
                        $this.closest($synonyms.selector).remove();
                        onDelete();
                    }
                });
            }

            /**
             * Initializes dynamic filter addition/deletion
             * @param  {function} onDelete Callback if a filter was deleted
             */
            function initDynamicFilters(onDelete) {
                $body.on("click", $filters.selector + " button", function () {
                    var $this = $(this);
                    if($this.find("[data-action='add']").is(":visible")) {
                        var $clone = $filters.clone();
                        $clone.find("[data-action='add']").hide();
                        $clone.find("[data-action='remove']").show();
                        $clone.insertAfter($filters);
                    } else {
                        $this.closest($filters.selector).remove();
                        onDelete();
                    }
                });
            }

            /**
             * Toggles input fields with type constraints related to the chosen
             * radio button
             */
            function toggleTypes() {
                var val = getCurrentType();
                $types.each(function () {
                    var $this = $(this);
                    if($this.attr("data-type-constraint").indexOf(val) > -1) {
                        $this.show();
                    } else {
                        $this.hide();
                    }
                });
            }

            /**
             * Initializes configurator events
             */
            function initEvents() {
                if($configurator.length) {

                    // Init live example and code.
                    // Do not run the configurator when changing the search
                    // value when the type is "array" or "regexp" as this could
                    // crash the browser due to syntax errors. In this case only
                    // run the configurator on manual button clicks.
                    var tmp = ":not([name='array']):not([name='regexp'])";
                    $body.on(
                        "input",
                        $textInputs.selector + tmp,
                        runConfigurator
                    );
                    $body.on(
                        "change",
                        $checkboxes.selector + "," + $selects.selector,
                        runConfigurator
                    );
                    runConfigurator();

                    // Init dynamic synonyms
                    initDynamicSynonyms(runConfigurator);

                    // Init dynamic filters
                    initDynamicFilters(runConfigurator);

                    // Init type radio buttons toggle
                    $body.on(
                        "change",
                        $typeRadioButtons.selector,
                        function () {
                            toggleTypes();
                            runConfigurator();
                        }
                    );
                    $body.on("click", $performButton.selector, function (event) {
                        event.preventDefault();
                        runConfigurator();
                    });
                    toggleTypes();
                }
            }

            initEvents();

        });
    });
})(this);
