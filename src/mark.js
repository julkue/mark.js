/*!***************************************************
 * mark.js v8.0.0
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
            "exclude": [],
            "iframes": false,
            "separateWordSearch": true,
            "diacritics": true,
            "synonyms": {},
            "accuracy": "partially",
            "each": () => {},
            "noMatch": () => {},
            "filter": () => true,
            "done": () => {},
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
     * term including synonyms, diacritics and accuracy if defined
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
        str = this.createMergedBlanksRegExp(str);
        str = this.createAccuracyRegExp(str);
        return str;
    }

    /**
     * Creates a regular expression string to match the defined synonyms
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
     * Creates a regular expression string that merges whitespace characters
     * including subsequent ones into a single pattern
     * @param  {string} str - The search term to be used
     * @return {string}
     * @access protected
     */
    createMergedBlanksRegExp(str) {
        return str.replace(/[\s]+/gmi, "[\\s]*");
    }

    /**
     * Creates a regular expression string to match the specified string with
     * the defined accuracy. As in the regular expression of "exactly" can be
     * a group containing a blank at the beginning, all regular expressions will
     * be created with two groups. The first group can be ignored (may contain
     * the said blank), the second contains the actual match
     * @param  {string} str - The searm term to be used
     * @return {str}
     * @access protected
     */
    createAccuracyRegExp(str) {
        let acc = this.opt.accuracy,
            val = typeof acc === "string" ? acc : acc.value,
            ls = typeof acc === "string" ? [] : acc.limiters,
            lsJoin = "";
        ls.forEach(limiter => {
            lsJoin += `|${this.escapeStr(limiter)}`;
        });
        switch(val) {
        case "partially":
            return `()(${str})`;
        case "complementary":
            return `()([^\\s${lsJoin}]*${str}[^\\s${lsJoin}]*)`;
        case "exactly":
            return `(^|\\s${lsJoin})(${str})(?=$|\\s${lsJoin})`;
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
     * Returns all contexts
     * @return [HTMLElement[]] - An array containing DOM contexts
     * @access protected
     */
    getContexts() {
        let ctx;
        if(typeof this.ctx === "undefined") {
            ctx = [];
        } else if(this.ctx instanceof HTMLElement) {
            ctx = [this.ctx];
        } else if(Array.isArray(this.ctx)) {
            ctx = this.ctx;
        } else { // NodeList
            ctx = Array.prototype.slice.call(this.ctx);
        }
        if(!ctx.length) {
            this.log("Empty context", "warn");
        }
        return ctx;
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
     * Checks if an element matches any of the specified exclude selectors. Also
     * it checks for script, style, title and optionally already marked elements
     * @param  {HTMLElement} el - The element to check
     * @param {boolean} exclM - If already marked elements should be excluded
     * too
     * @return {boolean}
     * @access protected
     */
    matchesExclude(el, exclM) {
        let remain = true;
        let excl = this.opt.exclude.concat(["script", "style", "title"]);
        if(exclM) {
            excl = excl.concat(["*[data-markjs='true']"]);
        }
        excl.every(sel => {
            if(this.matches(el, sel)) {
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
     * Callback for each iframe content
     * @callback Mark~forEachIframeCallback
     * @param {HTMLElement} html - The html element of the iframe
     */
     /**
      * Callback if all iframes were handled inside the context
      * @callback Mark~forEachIframeEndCallback
      */
    /**
     * Iterates over all iframes (recursive) inside the specified context and
     * calls the callback with its content
     * @param  {HTMLElement} ctx - The DOM context
     * @param  {Mark~forEachIframeCallback} cb - Each callback
     * @param  {Mark~forEachIframeEndCallback} end - End callback
     */
    forEachIframe(ctx, cb, end) {
        let ifr = ctx.querySelectorAll("iframe");
        ifr = Array.prototype.slice.call(ifr);
        if(ifr.length) {
            ifr.forEach(ifr => {
                this.onIframeReady(ifr, con => {
                    const html = con.querySelector("html");
                    this.forEachIframe(html, cb, () => {
                        cb(html);
                        end();
                    });
                }, () => {
                    const src = ifr.getAttribute("src");
                    this.log(`iframe "${src}" could not be accessed`, "warn");
                    end();
                });
            });
        } else {
            end();
        }
    }

    /**
     * Callback for each context
     * @callback Mark~forEachContextCallback
     * @param {HTMLElement} el - The DOM context
     */
    /**
     * Callback if all contexts were handled
     * @callback Mark~forEachContextEndCallback
     */
    /**
     * Calls the callback for each context. If there are iframes and the iframes
     * option is enabled, it will call the callback for each iframe too
     * @param  {Mark~forEachContextCallback} cb - Each callback
     * @param {Mark~forEachContextEndCallback} cb - End callback
     */
    forEachContext(cb, end) {
        const ctx = this.getContexts(),
            callCallbacks = el => {
                cb(el);
                if((--open) < 1) {
                    end();
                }
            };
        let open = ctx.length;
        if(open < 1) {
            end();
        }
        ctx.forEach(el => {
            if(this.opt.iframes) {
                this.forEachIframe(el, cb, () => {
                    callCallbacks(el);
                });
            } else {
                callCallbacks(el);
            }
        });
    }

    /**
     * Callback for each text node
     * @callback Mark~forEachTextNodeCallback
     * @param {HTMLElement} node - The DOM text node element
     */
    /**
     * Callback if ended
     * @callback Mark~forEachTextNodeEndCallback
     */
    /**
     * Calls the callback function for each text node of instance contexts and
     * iframes if the iframes option is enabled
     * @param  {Mark~forEachTextNodeCallback} cb - The callback function
     * @param {Mark~forEachTextNodeEndCallback} end - End callback
     * @access protected
     */
    forEachTextNode(cb, end) {
        let handled = [];
        this.forEachContext(ctx => {
            const isDescendant = handled.filter(handledCtx => {
                return handledCtx.contains(ctx);
            }).length > 0;
            if(handled.indexOf(ctx) > -1 || isDescendant){
                return;
            }
            handled.push(ctx);
            const itr = document.createNodeIterator(
                ctx,
                NodeFilter.SHOW_TEXT,
                node => {
                    if(!this.matchesExclude(node.parentNode, true)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                },
                false
            );
            let node;
            while(node = itr.nextNode()) {
                cb(node);
            }
        }, end);
    }

    /**
     * Filter callback before each wrapping
     * @callback Mark~wrapMatchesFilterCallback#
     * @param {string} match - The matching string
     */
    /**
     * Callback for each wrapped element
     * @callback Mark~wrapMatchesEachCallback
     * @param {HTMLElement} element - The marked DOM element
     */
    /**
     * Wraps the specified element and class around matches in the defined
     * DOM text node element
     * @param {object} node - The DOM text node
     * @param {RegExp} regex - The regular expression to be searched for
     * @param {boolean} custom - If true, the function expects a regular
     * expression that has at least two groups (like returned from
     * {@link Mark#createAccuracyRegExp}). The first group will be ignored and
     * the second will be wrapped
     * @param {Mark~wrapMatchesEachCallback} eachCb
     * @param {Mark~wrapMatchesFilterCallback} filterCb
     * @access protected
     */
    wrapMatches(node, regex, custom, filterCb, eachCb) {
        const hEl = !this.opt.element ? "mark" : this.opt.element,
            index = custom ? 0 : 2;
        let match;
        while((match = regex.exec(node.textContent)) !== null) {
            if(!filterCb(match[index])) {
                continue;
            }
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
                eachCb(repl);
            }
            regex.lastIndex = 0; // http://tinyurl.com/htsudjd
        }
    }

    /**
     * Unwraps the specified DOM node with its content (text nodes or HTML)
     * without destroying possibly present events (using innerHTML) and
     * normalizes the parent at the end (merge splitted text nodes)
     * @param  {HTMLElement} node - The DOM node to unwrap
     * @access protected
     */
    unwrapMatches(node) {
        const parent = node.parentNode;
        let docFrag = document.createDocumentFragment();
        while(node.firstChild) {
            docFrag.appendChild(node.removeChild(node.firstChild));
        }
        parent.replaceChild(docFrag, node);
        parent.normalize();
    }

    /**
     * Callback when finished
     * @callback Mark~commonDoneCallback
     * @param {number} totalMatches - The number of marked elements
     */
    /**
     * @typedef Mark~commonOptions
     * @type {object.<string>}
     * @property {string} [element="mark"] - HTML element tag name
     * @property {string} [className] - An optional class name
     * @property {string[]} [exclude - An array with exclusion selectors.
     * Elements matching those selectors will be ignored
     * @property {boolean} [iframes=false] - Whether to search inside iframes
     * @property {Mark~commonDoneCallback} [done]
     * @property {boolean} [debug=false] - Wheter to log messages
     * @property {object} [log=window.console] - Where to log messages (only if
     * debug is true)
     */
    /**
     * Callback for each marked element
     * @callback Mark~markRegExpEachCallback
     * @param {HTMLElement} element - The marked DOM element
     */
    /**
     * Callback if there were no matches
     * @callback Mark~markRegExpNoMatchCallback
     * @param {RegExp} regexp - The regular expression
     */
    /**
     * Callback to filter matches
     * @callback Mark~markRegExpFilterCallback
     * @param {HTMLElement} textNode - The text node which includes the match
     * @param {string} match - The matching string for the RegExp
     * @param {number} counter - A counter indicating the number of all marks
     */
    /**
     * These options also include the common options from
     * {@link Mark~commonOptions}
     * @typedef Mark~markRegExpOptions
     * @type {object.<string>}
     * @property {Mark~markRegExpEachCallback} [each]
     * @property {Mark~markRegExpNoMatchCallback} [noMatch]
     * @property {Mark~markRegExpFilterCallback} [filter]
     */
    /**
     * Marks a custom regular expression
     * @param  {RegExp} regexp - The regular expression
     * @param  {Mark~markRegExpOptions} [opt] - Optional options object
     * @access public
     */
    markRegExp(regexp, opt) {
        this.opt = opt;
        this.log(`Searching with expression "${regexp}"`);
        let totalMatches = 0;
        const eachCb = element => {
            totalMatches++;
            this.opt.each(element);
        };
        this.forEachTextNode(node => {
            this.wrapMatches(node, regexp, true, match => {
                return this.opt.filter(node, match, totalMatches);
            }, eachCb);
        }, () => {
            if(totalMatches === 0) {
                this.opt.noMatch(regexp);
            }
            this.opt.done(totalMatches);
        });
    }

    /**
     * Callback for each marked element
     * @callback Mark~markEachCallback
     * @param {HTMLElement} element - The marked DOM element
     */
    /**
     * Callback if there were no matches
     * @callback Mark~markNoMatchCallback
     * @param {RegExp} term - The search term that was not found
     */
    /**
     * Callback to filter matches
     * @callback Mark~markFilterCallback
     * @param {HTMLElement} textNode - The text node which includes the match
     * @param {string} match - The matching term
     * @param {number} termCounter - A counter indicating the number of marks
     * for the specific match
     * @param {number} totalCounter - A counter indicating the number of all
     * marks
     */
    /**
     * @typedef Mark~markAccuracyObject
     * @type {object.<string>}
     * @property {string} value - A accuracy string value
     * @property {string[]} limiters - A custom array of limiters. For example
     * <code>["-", ","]</code>
     */
    /**
     * These options also include the common options from
     * {@link Mark~commonOptions}
     * @typedef Mark~markOptions
     * @type {object.<string>}
     * @property {boolean} [separateWordSearch=true] - Whether to search for
     * each word separated by a blank instead of the complete term
     * @property {boolean} [diacritics=true] - If diacritic characters should be
     * matched. ({@link https://en.wikipedia.org/wiki/Diacritic Diacritics})
     * @property {object} [synonyms] - An object with synonyms. The key will be
     * a synonym for the value and the value for the key
     * @property {"partially"|"complementary"|"exactly"|Mark~markAccuracyObject}
     * [accuracy="partially"] - Either one of the following string values:
     * <ul>
     *   <li><i>partially</i>: When searching for "lor" only "lor" inside
     *   "lorem" will be marked</li>
     *   <li><i>complementary</i>: When searching for "lor" the whole word
     *   "lorem" will be marked</li>
     *   <li><i>exactly</i>: When searching for "lor" only those exact words
     *   will be marked. In this example nothing inside "lorem". This value
     *   is equivalent to the previous option <i>wordBoundary</i></li>
     * </ul>
     * Or an object containing two properties:
     * <ul>
     *   <li><i>value</i>: One of the above named string values</li>
     *   <li><i>limiters</i>: A custom array of string limiters for accuracy
     *   "exactly" or "complementary"</li>
     * </ul>
     * @property {Mark~markEachCallback} [each]
     * @property {Mark~markNoMatchCallback} [noMatch]
     * @property {Mark~markFilterCallback} [filter]
     */
    /**
     * Marks the specified search terms
     * @param {string|string[]} [sv] - Search value, either a search string or
     * an array containing multiple search strings
     * @param  {Mark~markOptions} [opt] - Optional options object
     * @access public
     */
    mark(sv, opt) {
        this.opt = opt;
        const {
            keywords: kwArr,
            length: kwArrLen
        } = this.getSeparatedKeywords(typeof sv === "string" ? [sv] : sv);
        let totalMatches = 0;
        if(kwArrLen === 0) {
            this.opt.done(totalMatches);
        }
        kwArr.forEach(kw => {
            let regex = new RegExp(this.createRegExp(kw), "gmi"),
                matches = 0;
            const eachCb = element => {
                matches++;
                totalMatches++;
                this.opt.each(element);
            };
            this.log(`Searching with expression "${regex}"`);
            this.forEachTextNode(node => {
                this.wrapMatches(node, regex, false, () => {
                    return this.opt.filter(node, kw, matches, totalMatches);
                }, eachCb);
            }, () => {
                if(matches === 0) {
                    this.opt.noMatch(kw);
                }
                if(kwArr[kwArrLen - 1] === kw) {
                    this.opt.done(totalMatches);
                }
            });
        });
    }

    /**
     * Removes all marked elements inside the context with their HTML and
     * normalizes the parent at the end
     * @param  {Mark~commonOptions} [opt] - Optional options object
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
        this.forEachContext(ctx => {
            const matches = ctx.querySelectorAll(sel);
            Array.prototype.slice.call(matches).forEach(el => {
                if(!this.matchesExclude(el, false)) {
                    this.unwrapMatches(el);
                }
            });
        }, this.opt.done);
    }

}
