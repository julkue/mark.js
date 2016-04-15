/*!***************************************************
 * jquery.mark v5.2.3
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
         * Elements matching those selectors will be ignored
         * @param {boolean} [opt.separateWordSearch=false] - If it should be
         * searched for each word (separated by a blank) instead of the complete
         * term (will only be used in <code>.perform()</code> and only if
         * <code>sv</code> is not a RegExp)
         * @param {boolean} [opt.diacritics=true] - If diacritic characters
         * should be matched. For example "justo" would also match "justò"
         * (will only be used in <code>.perform()</code> and only if
         * <code>sv</code> is not a RegExp)
         * @param {object} [opt.synonyms] - The key will be a synonym for the
         * value and the value for the key (will only be used in
         * <code>.perform()</code> and only if <code>sv</code> is not a RegExp)
         * @param {boolean} [opt.wordBoundary] - Whether to mark only matches
         * with a word boundary (will only be used in <code>.perform()</code>
         * and only if <code>sv</code> is not a RegExp)
         * @param {boolean} [opt.iframes=false] - Whether to search inside
         * iframes
         * @param {function} [opt.complete] - Callback on complete
         * @param {function} [opt.each] - A callback for each marked element.
         * This function receives the marked jQuery element as a parameter
         * (will only be used in <code>.perform()</code>)
         * @param {boolean} [opt.debug=false] - Set this option to true if you
         * want to log messages
         * @param {object} [opt.log=console] - Log messages to a specific
         * object (only if debug is true)
         * @param {string|array|RegExp} [sv] - Search value, either a search
         * string, an array containing multiple search strings or a RegExp
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
                "wordBoundary": false,
                "complete": function () {},
                "each": function () {},
                "debug": false,
                "log": window.console
            }, opt);
            /**
             * The search value. Can be an array of keywords or a RegExp
             * @type {array.<string>|RegExp}
             */
            this.sv = typeof sv === "string" ? [sv] : sv;
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
         * Escapes a string for usage within a regular expression
         * @param {string} str - The string to escape
         * @return {string}
         */
        escapeStr(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        /**
         * Creates a regular expression string to match the specified search
         * term including synonyms, diacritics and wordBoundary if defined
         * @param  {string} str - The search term to be used
         * @return {string}
         */
        createRegExp(str) {
            str = this.escapeStr(str);
            if(Object.keys(this.opt.synonyms).length > 0) {
                str = this.createSynonymsRegExp(str);
            }
            if(this.opt.diacritics) {
                str = this.createDiacriticsRegExp(str);
            }
            if(this.opt.wordBoundary) {
                str = this.createWordBoundaryRegExp(str);
            }
            return str;
        }

        /**
         * Creates a regular expression string to match the instance synonyms
         * @param  {string} str - The search term to be used
         * @return {string}
         */
        createSynonymsRegExp(str) {
            let syn = this.opt.synonyms;
            for(let index in syn) {
                if(syn.hasOwnProperty(index)) {
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
         * @param  {string} str - The search term to be used
         * @return {string}
         */
        createDiacriticsRegExp(str) {
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
         * Creates a regular expression string to match the specified string
         * only with a word boundary
         * @param  {string} str - The searm term to be used
         * @return {str}
         */
        createWordBoundaryRegExp(str) {
            return `\\b${str}\\b`;
        }

        /**
         * @typedef Mark~separatedKeywords
         * @type {object.<string>}
         * @property {array.<string>} keywords - The list of keywords
         * @property {number} length - The length
         */
        /**
         * Returns a list of keywords dependent on whether separate word search
         * was defined. Also it filters empty keywords
         * @return {Mark~separatedKeywords}
         */
        getSeparatedKeywords() {
            let stack = [];
            this.sv.forEach(kw => {
                if(!this.opt.separateWordSearch) {
                    if(kw.trim() !== "") {
                        stack.push(kw);
                    }
                } else {
                    kw.split(" ").forEach(kwSplitted => {
                        if(kwSplitted.trim() !== "") {
                            stack.push(kwSplitted);
                        }
                    });
                }
            });
            return {
                "keywords": stack,
                "length": stack.length
            };
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
         * Checks if an element matches any of the specified filters. Also it
         * checks for script, style, title and already marked elements
         * @param  {jquery} $el - The element to check
         * @param {boolean} exclM - If already marked elements should be
         * excluded
         * @return {boolean}
         */
        matchesFilter($el, exclM) {
            let remain = true;
            let fltr = this.opt.filter.concat(["script", "style", "title"]);
            if(!this.opt.iframes) {
                fltr = fltr.concat(["iframe"]);
            }
            if(exclM) {
                fltr = fltr.concat(["*[data-jquery-mark='true']"]);
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
         * @see {@link http://stackoverflow.com/a/36155560/3894981} for
         * background information
         */
        onIframeReady($i, successFn, errorFn) {
            try {
                const iCon = $i.first()[0].contentWindow,
                    bl = "about:blank",
                    compl = "complete";
                const callCallback = () => {
                    try {
                        const $con = $i.contents();
                        if($con.length === 0) { // https://git.io/vV8yU
                            throw new Error("iframe inaccessible");
                        }
                        successFn($con);
                    } catch(e) { // accessing contents failed
                        errorFn();
                    }
                };
                const observeOnload = () => {
                    $i.on("load.jqueryMark", () => {
                        try {
                            const src = $i.attr("src").trim(),
                                href = iCon.location.href;
                            if(href !== bl || src === bl || src === "") {
                                $i.off("load.jqueryMark");
                                callCallback();
                            }
                        } catch(e) {
                            errorFn();
                        }
                    });
                };
                if(iCon.document.readyState === compl) {
                    const src = $i.attr("src").trim(),
                        href = iCon.location.href;
                    if(href === bl && src !== bl && src !== "") {
                        observeOnload();
                    } else {
                        callCallback();
                    }
                } else {
                    observeOnload();
                }
            } catch(e) { // accessing contentWindow failed
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
                if(open === 0) checkEnd();
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
         * @param {boolean} [exclM=true] - If already marked elements should be
         * excluded
         */
        forEachElement(cb, end = function () {}, exclM = true) {
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
                if(!this.matchesFilter($el, exclM)) {
                    if($el.is("iframe")) {
                        this.forEachElementInIframe($el, ($iel) => {
                            if(!this.matchesFilter($iel, exclM)) {
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
         * Wraps the specified element and class around matches in the defined
         * DOM text node element
         * @param {object} node - The DOM text node
         * @param {RegExp} regex - The regular expression to be searched for
         */
        wrapMatches(node, regex) {
            let hEl = this.opt.element === "*" ? "span" : this.opt.element,
                hCl = this.opt.className === "*" ? "mark" : this.opt.className,
                match;
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
        }

        /**
         * Performs the mark of either the specified RegExp or all keywords
         */
        perform() {
            if(this.sv instanceof RegExp) {
                this.log(`Searching with expression "${this.sv}"`);
                this.forEachNode(node => {
                    this.wrapMatches(node, this.sv);
                }, this.opt.complete);
            } else {
                let {
                    keywords: kwArr,
                    length: kwArrLen
                } = this.getSeparatedKeywords();
                if(kwArrLen === 0) this.opt.complete();
                kwArr.forEach(kw => {
                    let regex = new RegExp(this.createRegExp(kw), "gmi");
                    this.log(`Searching with expression "${regex}"`);
                    this.forEachNode(node => {
                        this.wrapMatches(node, regex);
                    }, () => {
                        if(kwArr[kwArrLen - 1] === kw) this.opt.complete();
                    });
                });
            }
        }

        /**
         * Removes all marked elements inside the context with their HTML and
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
                    $this.replaceWith($this.html());
                    // Normalize parent (merge splitted text nodes)
                    $parent[0].normalize();
                }
            }, this.opt.complete, false);
        }
    }

    /**
     * The jQuery plugin namespace
     * @external "$.fn"
     */
    /**
     * Initializes an instance of Mark with the specified keywords and calls the
     * perform function
     * @param {string} kw - The keyword
     * @param {object} [opt] - The options
     * @see [Mark class options]{@link Mark}
     * @function external:"$.fn".mark
     * @example $(".context").mark("keyword", {
     *     "debug": true
     * })
     */
    $.fn.mark = function (kw, opt) {
        let instance = new Mark($(this), opt, kw);
        return instance.perform();
    };
    /**
     * Initializes an instance of Mark with the specified RegExp and calls the
     * perform function
     * @param {RegExp} reg - The regular expression
     * @param {object} [opt] - The options
     * @see [Mark class options]{@link Mark}
     * @function external:"$.fn".markRegExp
     * @example $(".context").markRegExp(/Lor[^]?m/gmi, {
     *     "debug": true
     * })
     */
    $.fn.markRegExp = function (reg, opt) {
        let instance = new Mark($(this), opt, reg);
        return instance.perform();
    };
    /**
     * Initializes an instance of Mark and calls the remove function
     * @param {object} [opt] - The options
     * @see [Mark class options]{@link Mark}
     * @function external:"$.fn".removeMark
     * @example $(".context").removeMark({
     *     "debug": true
     * });
     */
    $.fn.removeMark = function (opt) {
        let instance = new Mark($(this), opt);
        return instance.remove();
    };

});
