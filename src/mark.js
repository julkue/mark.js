/*!***************************************************
 * mark.js v6.0.1
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
/**
 * Marks search terms in DOM elements
 */
class Mark {

    /**
     * @param {HTMLElement|HTMLElement[]|NodeList} ctx - The context DOM
     * element, an array of DOM elements or a NodeList
     */
    constructor(ctx) {
        /**
         * The context
         * @type {HTMLElement|HTMLElement[]|NodeList}
         */
        this.ctx = ctx;
    }

    /**
     * Options defined by the user. They will be initialized from one of the
     * public methods. See {@link Mark#mark}, {@link Mark#markRegExp} and
     * {@link Mark#unmark} for option properties.
     * @type {object}
     */
    set opt(val) {
        this._opt = Object.assign({}, {
            "element": "",
            "className": "",
            "filter": [],
            "iframes": false,
            "separateWordSearch": true,
            "diacritics": true,
            "synonyms": {},
            "accuracy": "partially",
            "each": () => {},
            "complete": () => {},
            "debug": false,
            "log": window.console
        }, val);
    }

    get opt() {
        return this._opt;
    }

    /**
     * Logs a message if log is enabled
     * @param {string} msg - The message to log
     * @param {string} [level="debug"] - The log level, e.g. <code>warn</code>
     * <code>error</code>, <code>debug</code>
     * @access protected
     */
    log(msg, level = "debug") {
        const log = this.opt.log;
        if(!this.opt.debug) {
            return;
        }
        if(typeof log === "object" && typeof log[level] === "function") {
            log[level](`mark.js: ${msg}`);
        }
    }

    /**
     * Escapes a string for usage within a regular expression
     * @param {string} str - The string to escape
     * @return {string}
     * @access protected
     */
    escapeStr(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    /**
     * Creates a regular expression string to match the specified search
     * term including synonyms, diacritics and wordBoundary if defined
     * @param  {string} str - The search term to be used
     * @return {string}
     * @access protected
     */
    createRegExp(str) {
        str = this.escapeStr(str);
        if(Object.keys(this.opt.synonyms).length) {
            str = this.createSynonymsRegExp(str);
        }
        if(this.opt.diacritics) {
            str = this.createDiacriticsRegExp(str);
        }
        str = this.createAccuracyRegExp(str);
        return str;
    }

    /**
     * Creates a regular expression string to match the instance synonyms
     * @param  {string} str - The search term to be used
     * @return {string}
     * @access protected
     */
    createSynonymsRegExp(str) {
        const syn = this.opt.synonyms;
        for(let index in syn) {
            if(syn.hasOwnProperty(index)) {
                const value = syn[index],
                    k1 = this.escapeStr(index),
                    k2 = this.escapeStr(value);
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
     * @access protected
     */
    createDiacriticsRegExp(str) {
        const dct = [
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
        let handled = [];
        str.split("").forEach(ch => {
            dct.every(dct => {
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
     * Creates a regular expression string to match the specified string with
     * the defined accuracy. As in the regular expression of "exactly" can be
     * a blank at the beginning, all regular expressions will be created with
     * two groups. The first group can be ignored (may contain the said blank),
     * the second contains the actual match
     * @param  {string} str - The searm term to be used
     * @return {str}
     * @access protected
     */
    createAccuracyRegExp(str) {
        switch(this.opt.accuracy) {
        case "partially":
            return `()(${str})`;
        case "complementary":
            return `()(\\S*${str}\\S*)`;
        case "exactly":
            return `(^|\\s)(${str})(?=\\s|$)`;
        }
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
     * @param {array} sv - The array of keywords
     * @return {Mark~separatedKeywords}
     * @access protected
     */
    getSeparatedKeywords(sv) {
        let stack = [];
        sv.forEach(kw => {
            if(!this.opt.separateWordSearch) {
                if(kw.trim()) {
                    stack.push(kw);
                }
            } else {
                kw.split(" ").forEach(kwSplitted => {
                    if(kwSplitted.trim()) {
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
     * @property {array} elements - An array containing the instance DOM
     * elements
     * @property {number} length - The array length
     */
    /**
     * Returns the context and all children elements
     * @return {Mark~elements}
     * @access protected
     */
    getElements() {
        let ctx,
            stack = [];
        if(typeof this.ctx === "undefined") {
            ctx = [];
        } else if(this.ctx instanceof HTMLElement) {
            ctx = [this.ctx];
        } else if(Array.isArray(this.ctx)) {
            ctx = this.ctx;
        } else { // NodeList
            ctx = Array.prototype.slice.call(this.ctx);
        }
        ctx.forEach(ctx => {
            stack.push(ctx);
            const childs = ctx.querySelectorAll("*");
            if(childs.length) {
                stack = stack.concat(Array.prototype.slice.call(childs));
            }
        });
        if(!ctx.length) {
            this.log("Empty context", "warn");
        }
        return {
            "elements": stack,
            "length": stack.length
        };
    }

    /**
     * Checks if a DOM element matches a specified selector
     * @param  {HTMLElement} el - The DOM element
     * @param  {string} selector - The selector
     * @return {boolean}
     * @access protected
     */
    matches(el, selector) {
        return(
            el.matches ||
            el.matchesSelector ||
            el.msMatchesSelector ||
            el.mozMatchesSelector ||
            el.webkitMatchesSelector ||
            el.oMatchesSelector
        ).call(el, selector);
    }

    /**
     * Checks if an element matches any of the specified filters. Also it checks
     * for script, style, title and already marked elements
     * @param  {HTMLElement} el - The element to check
     * @param {boolean} exclM - If already marked elements should be excluded
     * too
     * @return {boolean}
     * @access protected
     */
    matchesFilter(el, exclM) {
        let remain = true;
        let fltr = this.opt.filter.concat(["script", "style", "title"]);
        if(!this.opt.iframes) {
            fltr = fltr.concat(["iframe"]);
        }
        if(exclM) {
            fltr = fltr.concat(["*[data-markjs='true']"]);
        }
        fltr.every(filter => {
            if(this.matches(el, filter)) {
                return remain = false;
            }
            return true;
        });
        return !remain;
    }

    /**
     * Callback when the iframe is ready
     * @callback Mark~onIframeReadySuccessCallback
     * @param {HTMLElement} contents - The contentDocument of the iframe
     */
    /**
     * Callback if iframe can not be accessed
     * @callback Mark~onIframeReadyErrorCallback
     */
    /**
     * Calls the callback if the specified iframe is ready for DOM access
     * @param  {HTMLElement} ifr - The iframe DOM element
     * @param  {Mark~onIframeReadySuccessCallback} successFn - Success callback
     * @param {Mark~onIframeReadyErrorCallback} errorFn - Error callback
     * @see {@link http://stackoverflow.com/a/36155560/3894981} for
     * background information
     * @access protected
     */
    onIframeReady(ifr, successFn, errorFn) {
        try {
            const ifrWin = ifr.contentWindow,
                bl = "about:blank",
                compl = "complete";
            const callCallback = () => {
                try {
                    if(ifrWin.document === null) { // no permission
                        throw new Error("iframe inaccessible");
                    }
                    successFn(ifrWin.document);
                } catch(e) { // accessing contentDocument failed
                    errorFn();
                }
            };
            const isBlank = () => {
                const src = ifr.getAttribute("src").trim(),
                    href = ifrWin.location.href;
                return href === bl && src !== bl && src;
            };
            const observeOnload = () => {
                const listener = () => {
                    try {
                        if(!isBlank()) {
                            ifr.removeEventListener("load", listener);
                            callCallback();
                        }
                    } catch(e) {
                        errorFn();
                    }
                };
                ifr.addEventListener("load", listener);
            };
            if(ifrWin.document.readyState === compl) {
                if(isBlank()) {
                    observeOnload();
                } else {
                    callCallback();
                }
            } else {
                observeOnload();
            }
        } catch(e) { // accessing contentDocument failed
            errorFn();
        }
    }

    /**
     * Callback for each element inside the specified iframe
     * @callback Mark~forEachElementInIframeCallback
     * @param {HTMLElement} element - The DOM element
     * @param {integer} length - The length of all elements. Note that this does
     * not include elements <i>inside</i> an iframe. An iframe itself will be
     * counted as one element
     */
    /**
     * Callback if ended
     * @callback Mark~forEachElementInIframeEndCallback
     */
    /**
     * Calls the callback for each element inside an iframe recursively
     * @param  {HTMLElement} ifr - The iframe DOM element
     * @param  {Mark~forEachElementInIframeCallback} cb - The callback
     * @param {Mark~forEachElementInIframeEndCallback} [end] - End callback
     * @access protected
     */
    forEachElementInIframe(ifr, cb, end = function () {}) {
        let open = 0;
        const checkEnd = () => {
            if((--open) < 1) {
                end();
            }
        };
        this.onIframeReady(ifr, con => {
            const stack = Array.prototype.slice.call(con.querySelectorAll("*"));
            if((open = stack.length) === 0) {
                checkEnd();
            }
            stack.forEach(el => {
                if(el.tagName.toLowerCase() === "iframe") {
                    let j = 0;
                    this.forEachElementInIframe(el, (iel, len) => {
                        cb(iel, len);
                        if((len - 1) === j) {
                            checkEnd();
                        }
                        j++;
                    }, checkEnd);
                } else {
                    cb(el, stack.length);
                    checkEnd();
                }
            });
        }, () => {
            let src = ifr.getAttribute("src");
            this.log(`iframe '${src}' could not be accessed`, "warn");
            checkEnd();
        });
    }

    /**
     * Callback for each element
     * @callback Mark~forEachElementCallback
     * @param {HTMLElement} element - The DOM element
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
     * @access protected
     */
    forEachElement(cb, end = function () {}, exclM = true) {
        let {
            elements: stack,
            length: open
        } = this.getElements();
        const checkEnd = () => {
            if((--open) === 0) {
                end();
            }
        };
        checkEnd(++open); // no context elements
        stack.forEach(el => {
            if(!this.matchesFilter(el, exclM)) {
                if(el.tagName.toLowerCase() === "iframe") {
                    this.forEachElementInIframe(el, (iel) => {
                        if(!this.matchesFilter(iel, exclM)) {
                            cb(iel);
                        }
                    }, checkEnd);
                    return; // avoid further code execution
                } else {
                    cb(el);
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
     * @access protected
     */
    forEachNode(cb, end = function () {}) {
        this.forEachElement(n => {
            for(n = n.firstChild; n; n = n.nextSibling) {
                if(n.nodeType === 3 && n.textContent.trim()) {
                    cb(n);
                }
            }
        }, end);
    }

    /**
     * Wraps the specified element and class around matches in the defined
     * DOM text node element
     * @param {object} node - The DOM text node
     * @param {RegExp} regex - The regular expression to be searched for
     * @param {boolean} custom - If true, the function expects a regular
     * expression that has at least two groups (like returned from
     * {@link Mark#createAccuracyRegExp}). The first group will be ignored and
     * the second will be wrapped
     * @access protected
     */
    wrapMatches(node, regex, custom = false) {
        const hEl = !this.opt.element ? "mark" : this.opt.element,
            index = custom ? 0 : 2;
        let match;
        while((match = regex.exec(node.textContent)) !== null) {
            // Split the text node at the start and the end of the match and
            // replace the new node with the specified element
            let pos = match.index;
            if(!custom) {
                pos += match[index - 1].length;
            }
            let startNode = node.splitText(pos);
            // The DOM reference of node will get lost due to
            // splitText. Therefore it is necessary to save the new
            // created element in "node"
            node = startNode.splitText(match[index].length);
            if(startNode.parentNode !== null) {
                let repl = document.createElement(hEl);
                repl.setAttribute("data-markjs", "true");
                if(this.opt.className) {
                    repl.setAttribute("class", this.opt.className);
                }
                repl.textContent = match[index];
                startNode.parentNode.replaceChild(repl, startNode);
                this.opt.each(repl);
            }
            regex.lastIndex = 0; // http://tinyurl.com/htsudjd
        }
    }


    /**
     * Callback on completed
     * @callback Mark~completeCallback
     */
    /**
     * Callback for each marked element
     * @callback Mark~eachCallback
     * @param {HTMLElement} element - The marked DOM element
     */
    /**
     * @typedef Mark~options
     * @type {object.<string>}
     * @property {string} [element="mark"] - HTML element tag name
     * @property {string} [className] - An optional class name that will be
     * appended to <code>element</code>
     * @property {string[]} [filter - An array with exclusion selectors.
     * Elements matching those selectors will be ignored
     * @property {boolean} [iframes=false] - Whether to search inside iframes
     * @property {Mark~completeCallback} [complete]
     * @property {Mark~eachCallback} [each]
     * @property {boolean} [debug=false] - Wheter to log messages
     * @property {object} [log=window.console] - Where to log messages (only if
     * debug is true)
     */
    /**
     * Marks a custom regular expression
     * @param  {RegExp} regexp - The regular expression
     * @param  {Mark~options} [opt] - Optional option object
     * @access public
     */
    markRegExp(regexp, opt) {
        this.opt = opt;
        this.log(`Searching with expression "${regexp}"`);
        this.forEachNode(node => {
            this.wrapMatches(node, regexp, true);
        }, this.opt.complete);
    }

    /**
     * These options also include the standard
     * options from {@link Mark~options}
     * @typedef Mark~advancedOptions
     * @type {object.<string>}
     * @property {boolean} [separateWordSearch=true] - Whether to search for
     * each word separated by a blank instead of the complete term
     * @property {boolean} [diacritics=true] - If diacritic characters should be
     * matched. ({@link https://en.wikipedia.org/wiki/Diacritic Diacritics})
     * @property {object} [synonyms] - An object with synonyms. The key will be
     * a synonym for the value and the value for the key
     * @property {("partially"|"complementary"|"exactly")}
     * [accuracy="partially"] - Either one of the following values:
     * <ul>
     *   <li><i>partially</i>: When searching for "lor" only "lor" inside
     *   "lorem" will be marked</li>
     *   <li><i>complementary</i>: When searching for "lor" the whole word
     *   "lorem" will be marked</li>
     *   <li><i>exactly</i>: When searching for "lor" only those exact words
     *   will be marked. In this example nothing inside "lorem". This value
     *   is equivalent to the previous option <i>wordBoundary</i></li>
     * </ul>
     * @extends Mark~options
     */
    /**
     * Marks the defined search terms
     * @param {string|string[]} [sv] - Search value, either a search string or
     * an array containing multiple search strings
     * @param  {Mark~advancedOptions} [opt] - Optional option object
     * @access public
     */
    mark(sv, opt) {
        this.opt = opt;
        sv = typeof sv === "string" ? [sv] : sv;
        let {
            keywords: kwArr,
            length: kwArrLen
        } = this.getSeparatedKeywords(sv);
        if(kwArrLen === 0) {
            this.opt.complete();
        }
        kwArr.forEach(kw => {
            let regex = new RegExp(this.createRegExp(kw), "gmi");
            this.log(`Searching with expression "${regex}"`);
            this.forEachNode(node => {
                this.wrapMatches(node, regex);
            }, () => {
                if(kwArr[kwArrLen - 1] === kw) {
                    this.opt.complete();
                }
            });
        });
    }

    /**
     * Removes all marked elements inside the context with their HTML and
     * normalizes the parent at the end
     * @param  {Mark~options} [opt] - Optional option object
     * @access public
     */
    unmark(opt) {
        this.opt = opt;
        let sel = this.opt.element ? this.opt.element : "*";
        sel += "[data-markjs]";
        if(this.opt.className) {
            sel += `.${this.opt.className}`;
        }
        this.log(`Removal selector "${sel}"`);
        this.forEachElement(el => {
            if(this.matches(el, sel)) {
                const parent = el.parentNode;
                let docFrag = document.createDocumentFragment();
                while(el.firstChild) {
                    docFrag.appendChild(el.removeChild(el.firstChild));
                }
                parent.replaceChild(docFrag, el);
                // Normalize parent (merge splitted text nodes)
                parent.normalize();
            }
        }, this.opt.complete, false);
    }

}
