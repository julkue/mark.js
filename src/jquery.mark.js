/*!***************************************************
 * jquery.mark v5.0.0
 * https://github.com/julmot/jquery.mark
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vaizN
 *****************************************************/
"use strict";
(factory => {
    if(typeof define === "function" && define.amd) {
        define(["jquery"], jQuery => {
            return factory(jQuery);
        });
    } else if(typeof exports === "object") {
        factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})($ => {
    /**
     * Marks search terms in DOM elements
     */
    class Mark {

        /**
         * @param {jquery} $ctx - Context element, e.g.
         * <code>$(".context")</code>
         * @param {object} [opt] - Options
         * @param {string} [opt.element=span] - HTML element tag name
         * @param {string} [opt.className=mark] - A class name
         * @param {array} [opt.filter] - An array with exclusion selectors.
         * Elements matching those selectors will be ignored.
         * @param {boolean} [opt.separateWordSearch=false] - If the plugin
         * should search for each word (separated by a blank) instead of the
         * complete term
         * @param {boolean} [opt.diacritics=true] - If diacritic characters
         * should be matched. For example "justo" would also match "justò"
         * @param {object} [opt.synonyms] - The key will be a synonym for the
         * value and the value for the key.
         * @param {boolean} [opt.iframes=false] - Whether to search inside
         * iframes
         * @param {function} [opt.complete] - Callback after all marks are
         * completed
         * @param {function} [opt.each] - A callback for each marked element.
         * This function receives the marked jQuery element as a parameter
         * @param {boolean} [opt.debug=false] - Set this option to true if you
         * want to log messages
         * @param {object} [opt.log=console] - Log messages to a specific
         * object (only if debug is true)
         * @param {string|array} [sv] - Search value, either a search string
         * or an array containing multiple search strings
         */
        constructor($ctx, opt, sv) {
            /**
             * Options defined by the user
             * @type {object}
             */
            this.opt = Object.assign({}, {
                "element": "*",
                "className": "*",
                "filter": [],
                "separateWordSearch": false,
                "diacritics": true,
                "synonyms": {},
                "iframes": false,
                "complete": function () {},
                "each": function () {},
                "debug": false,
                "log": window.console
            }, opt);
            /**
             * List of keywords
             * @type {array.<string>}
             */
            this.kw = typeof sv === "string" ? [sv] : sv;
            /**
             * The context element
             * @type {jquery}
             */
            this.$ctx = $ctx;
            /**
             * A list of diacritic and normal characters that should be treated
             * equally
             * @type {array.<string>}
             */
            this.dct = [
                "aÀÁÂÃÄÅàáâãäåĀāąĄ",
                "cÇçćĆčČ",
                "dđĐďĎ",
                "eÈÉÊËèéêëěĚĒēęĘ",
                "iÌÍÎÏìíîïĪī",
                "lłŁ",
                "nÑñňŇńŃ",
                "oÒÓÔÕÕÖØòóôõöøŌō",
                "rřŘ",
                "sŠšśŚ",
                "tťŤ",
                "uÙÚÛÜùúûüůŮŪū",
                "yŸÿýÝ",
                "zŽžżŻźŹ"
            ];
        }

        /**
         * Escapes a string for usage within a regular expression
         * @param {string} str - The string to escape
         * @return {string}
         */
        escapeStr(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        /**
         * Logs a message if log is enabled
         * @param {string} msg - The message to log
         * @param {string} [level=debug] - The log level, e.g. <code>warn</code>
         * <code>error</code>, <code>debug</code>
         */
        log(msg, level = "debug") {
            if(!this.opt.debug) {
                return;
            }
            let log = this.opt.log;
            if(typeof log === "object" && typeof log[level] === "function") {
                log[level](`jquery.mark: ${msg}`);
            }
        }

        /**
         * Creates a regular expression string to match the specified search
         * term including synonyms and diacritics if defined
         * @param  {string} str - The search term
         * @return {string}
         */
        getRegexp(str) {
            if(str === "") {
                return str;
            }
            if(Object.keys(this.opt.synonyms).length > 0) {
                str = this.getSynonymsRegexp(str);
            }
            if(this.opt.diacritics) {
                str = this.getDiacriticsRegexp(str);
            }
            return str;
        }

        /**
         * Creates a regular expression string to match the specified synonyms
         * @param  {string} str - The search term
         * @return {string}
         */
        getSynonymsRegexp(str) {
            if(str === "") {
                return str;
            }
            let syn = this.opt.synonyms;
            for(let index in syn) {
                if(syn.hasOwnProperty(index)){
                    let value = syn[index];
                    let k1 = this.escapeStr(index);
                    let k2 = this.escapeStr(value);
                    str = str.replace(
                        new RegExp(`(${k1}|${k2})`, "gmi"), `(${k1}|${k2})`
                    );
                }
            }
            return str;
        }

        /**
         * Creates a regular expression string to match diacritics
         * @param  {string} str - The search term
         * @return {string}
         */
        getDiacriticsRegexp(str) {
            if(str === "") {
                return str;
            }
            let charArr = str.split("");
            let handled = [];
            charArr.forEach(ch => {
                this.dct.every(dct => {
                    // Check if the character is inside a diacritics list
                    if(dct.indexOf(ch) !== -1) {
                        // Check if the related diacritics list was not
                        // handled yet
                        if(handled.indexOf(dct) > -1) {
                            return false;
                        }
                        // Make sure that the character OR any other
                        // character in the diacritics list will be matched
                        str = str.replace(
                            new RegExp(`[${dct}]`, "gmi"), `[${dct}]`
                        );
                        handled.push(dct);
                    }
                    return true;
                });
            });
            return str;
        }

        /**
         * Returns an array containing keywords dependent on whether separate
         * word search was defined. Also it filters empty keywords
         * @return {array.<string>}
         */
        getSeparatedKeywords() {
            let stack = [];
            this.kw.forEach(kw => {
                if(!this.opt.separateWordSearch) {
                    if(kw !== ""){
                        stack.push(kw);
                    }
                } else {
                    kw.split(" ").forEach(kwSplitted => {
                        if(kwSplitted !== ""){
                            stack.push(kwSplitted);
                        }
                    });
                }
            });
            return stack;
        }

        /**
         * @typedef Mark~elements
         * @type {object.<string>}
         * @property {jquery} elements - The elements
         * @property {number} length - The elements length
         */
        /**
         * Returns the context and all children elements
         * @return {Mark~elements}
         */
        getElements() {
            if(this.$ctx.length < 1) {
                this.log("Empty context", "warn");
            }
            let $stack = this.$ctx.add(this.$ctx.find("*"));
            let length = $stack.length;
            return {
                "elements": $stack,
                "length": length
            };
        }

        /**
         * Checks if an element matches any of the specified filters or script,
         * style and title
         * @param  {jquery} $el - The element to check
         * @return {boolean}
         */
        matchesFilter($el) {
            let remain = true;
            let fltr = this.opt.filter.concat(["script", "style", "title"]);
            if(!this.opt.iframes) {
                fltr = fltr.concat(["iframe"]);
            }
            fltr.every(filter => {
                if($el.is(filter)) {
                    return remain = false;
                }
                return true;
            });
            return !remain;
        }

        /**
         * Callback when iframe is ready
         * @callback Mark~onIframeReadySuccessCallback
         * @param {jquery} $contents - jQuery contents element
         */
        /**
         * Callback if iframe can not be accessed
         * @callback Mark~onIframeReadyErrorCallback
         */
        /**
         * Calls the callback if the specified iframe is ready for DOM access
         * @param  {jquery} $i - The jQuery iframe element
         * @param  {Mark~onIframeReadySuccessCallback} successFn - Success
         * callback
         * @param {Mark~onIframeReadyErrorCallback} errorFn - Error callback
         * @see {@link http://stackoverflow.com/a/36155560/3894981} for further
         * information how this function works
         */
        onIframeReady($i, successFn, errorFn) {
            let bl = "about:blank",
                compl = "complete";
            try {
                let iCon = $i.first()[0].contentWindow;
                if(iCon.document.readyState === compl) {
                    if(iCon.location.href === bl && $i.attr("src") !== bl) {
                        var call = 0,
                            interval = setInterval(function () {
                                try {
                                    if((++call) > 400) { // 60sec
                                        throw new Error("iframe inaccessable");
                                    }
                                    if(iCon.location.href !== bl) {
                                        if(iCon.document.readyState === compl) {
                                            clearInterval(interval);
                                            successFn($i.contents());
                                        }
                                    }
                                } catch(e) {
                                    clearInterval(interval);
                                    errorFn();
                                }
                            }, 150);
                    } else {
                        successFn($i.contents());
                    }
                } else {
                    $i.one("load", function () {
                        try {
                            successFn($i.contents());
                        } catch(e) {
                            errorFn();
                        }
                    });
                }
            } catch(e) {
                errorFn();
            }
        }

        /**
         * Callback for each element inside the specified iframe
         * @callback Mark~forEachElementInIframeCallback
         * @param {jquery} $element - The jQuery element
         * @param {integer} length - The length of all elements. Note that this
         * does not include elements <i>inside</i> an iframe. An iframe itself
         * will be counted as one element
         */
        /**
         * Callback if ended
         * @callback Mark~forEachElementInIframeEndCallback
         */
        /**
         * Calls the callback for each element inside an iframe
         * @param  {jquery} $i - The jQuery iframe element
         * @param  {Mark~forEachElementInIframeCallback} cb - The callback
         * @param {Mark~forEachElementInIframeEndCallback} [end] - End callback
         */
        forEachElementInIframe($i, cb, end = function () {}) {
            let open = 0,
                checkEnd = () => {
                    if((--open) < 1) end();
                };
            this.onIframeReady($i, $con => {
                let $stack = $con.find("*");
                open = $stack.length;
                $stack.each((i, el) => {
                    let $el = $(el);
                    if($el.is("iframe")) {
                        let j = 0;
                        this.forEachElementInIframe($el, ($iel, len) => {
                            cb($iel, len);
                            if((len - 1) === j) checkEnd();
                            j++;
                        }, checkEnd);
                    } else {
                        cb($el, $stack.length);
                        checkEnd();
                    }
                });
            }, () => {
                let src = $i.attr("src");
                this.log(`iframe '${src}' could not be accessed`, "warn");
                checkEnd();
            });
        }

        /**
         * Callback for each element
         * @callback Mark~forEachElementCallback
         * @param {jquery} $element - The jQuery element
         */
        /**
         * Callback if ended
         * @callback Mark~forEachElementEndCallback
         */
        /**
         * Calls the callback for each element including those inside an iframe
         * within the instance context (filtered)
         * @param  {Mark~forEachElementCallback} cb - The callback
         * @param {Mark~forEachElementEndCallback} [end] - End callback
         */
        forEachElement(cb, end = function () {}) {
            let {
                elements: $stack,
                length: open
            } = this.getElements(),
                checkEnd = () => {
                    if((--open) === 0) end();
                };
            if(open === 0) end(); // no context elements
            $stack.each((i, el) => {
                let $el = $(el);
                if(!this.matchesFilter($el)) {
                    if($el.is("iframe")) {
                        this.forEachElementInIframe($el, ($iel) => {
                            if(!this.matchesFilter($iel)) {
                                cb($iel);
                            }
                        }, checkEnd);
                        return; // avoid further code execution
                    } else {
                        cb($el);
                    }
                }
                checkEnd();
            });
        }

        /**
         * Callback for each node
         * @callback Mark~forEachNodeCallback
         * @param {object} node - The DOM text node element
         */
        /**
         * Callback if ended
         * @callback Mark~forEachNodeEndCallback
         */
        /**
         * Calls the callback function for each text node of instance context
         * elements
         * @param  {Mark~forEachNodeCallback} cb - The callback function
         * @param {Mark~forEachNodeEndCallback} [end] - End callback
         */
        forEachNode(cb, end = function () {}) {
            this.forEachElement(($el) => {
                $el.contents().each((i, n) => {
                    if(n.nodeType === 3 && n.textContent.trim() !== "") {
                        cb(n);
                    }
                });
            }, end);
        }

        /**
         * Wraps the specified element and class around keywords in all text
         * nodes of instance elements
         */
        perform() {
            let hEl = this.opt.element === "*" ? "span" : this.opt.element;
            let hCl = this.opt.className === "*" ? "mark" : this.opt.className;
            let kwArr = this.getSeparatedKeywords(),
                kwArrLen = kwArr.length
            if(kwArrLen === 0) this.opt.complete();
            kwArr.forEach(kw => {
                let exp = this.getRegexp(this.escapeStr(kw));
                let regex = new RegExp(exp, "gmi");
                this.log(`Searching with expression "${exp}"`);
                this.forEachNode(node => {
                    let match;
                    while((match = regex.exec(node.textContent)) !== null) {
                        // Split the text node and
                        // replace match with mark element
                        let startNode = node.splitText(match.index);
                        // The DOM reference of node will get lost due to
                        // splitText. Therefore it is necessary to save the new
                        // created element in "node"
                        node = startNode.splitText(match[0].length);
                        if(startNode.parentNode !== null) {
                            let $repl = $(`<${hEl} />`, {
                                "class": hCl,
                                "data-jquery-mark": true,
                                "text": match[0]
                            });
                            startNode.parentNode.replaceChild(
                                $repl[0],
                                startNode
                            );
                            this.opt.each($repl);
                        }
                        regex.lastIndex = 0; // http://tinyurl.com/htsudjd
                    }
                }, () => {
                    if(kwArr[kwArrLen - 1] === kw) this.opt.complete();
                });
            });
        }

        /**
         * Removes all marked elements inside the context with their text and
         * normalizes the parent at the end
         */
        remove() {
            let sel = `${this.opt.element}[data-jquery-mark="true"]`;
            let hCl = this.opt.className;
            if(hCl !== "*") {
                sel += `.${hCl}`;
            }
            this.log(`Removal selector "${sel}"`);
            this.forEachElement(el => {
                let $this = $(el);
                if($this.is(sel)) {
                    let $parent = $this.parent();
                    $this.replaceWith($this.text());
                    // Normalize parent (merge splitted text nodes)
                    $parent[0].normalize();
                }
            }, this.opt.complete);
        }
    }

    /**
     * The jQuery plugin namespace
     * @external "$.fn"
     */
    /**
     * Initializes an instance of Mark and calls the perform function
     * @param {string} kw - The keyword
     * @param {object} [opt] - The options
     * @see [Detailed parameter information]{@link
     * https://github.com/julmot/jquery.mark#2-mark-usage}
     * @see [Mark class]{@link Mark}
     * @function external:"$.fn".mark
     * @example $(".context").mark("keyword", {
     *     "separateWordSearch": true
     * })
     */
    $.fn.mark = function (kw, opt) {
        let instance = new Mark($(this), opt, kw);
        return instance.perform();
    };
    /**
     * Initializes an instance of Mark and calls the remove function
     * @param {object} [opt] - The options
     * @see [Detailed parameter information]{@link
     * https://github.com/julmot/jquery.mark#3-mark-removal-usage}
     * @see [Mark class]{@link Mark}
     * @function external:"$.fn".removeMark
     * @example $(".context").removeMark();
     */
    $.fn.removeMark = function (opt) {
        let instance = new Mark($(this), opt);
        return instance.remove();
    };

});
