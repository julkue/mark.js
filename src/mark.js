/*!***************************************************
 * mark.js v8.0.0
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
/**
 * Marks search terms in DOM elements
 * @example
 * new Mark(document.querySelector(".context")).mark("lorem ipsum");
 * @example
 * new Mark(document.querySelector(".context")).markRegExp(/lorem/gmi);
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
         * @access protected
         */
        this.ctx = ctx;
    }

    /**
     * Options defined by the user. They will be initialized from one of the
     * public methods. See {@link Mark#mark}, {@link Mark#markRegExp} and
     * {@link Mark#unmark} for option properties.
     * @type {object}
     * @access protected
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
            "acrossElements": false,
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
     * An instance of DOMIterator
     * @type {DOMIterator}
     * @access protected
     */
    get iterator() {
        if(!this._iterator) {
            this._iterator = new DOMIterator(this.ctx, this.opt.iframes);
        }
        return this._iterator;
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
                if(kw.trim() && stack.indexOf(kw) === -1) {
                    stack.push(kw);
                }
            } else {
                kw.split(" ").forEach(kwSplitted => {
                    if(kwSplitted.trim() && stack.indexOf(kwSplitted) === -1) {
                        stack.push(kwSplitted);
                    }
                });
            }
        });
        return {
            // sort because of https://git.io/v6USg
            "keywords": stack.sort((a, b) => {
                return b.length - a.length;
            }),
            "length": stack.length
        };
    }

    /**
     * @typedef Mark~getTextNodesDict
     * @type {object.<string>}
     * @property {string} value - The composite value of all text nodes
     * @property {object[]} nodes - An array of objects
     * @property {number} nodes.start - The start position within the composite
     * value
     * @property {number} nodes.end - The end position within the composite
     * value
     * @property {HTMLElement} nodes.node - The DOM text node element
     */
    /**
     * Callback
     * @callback Mark~getTextNodesCallback
     * @param {Mark~getTextNodesDict}
     */
    /**
     * Calls the callback with an object containing all text nodes (including
     * iframe text nodes) with start and end positions and the composite value
     * of them (string)
     * @param {Mark~getTextNodesCallback} cb - Callback
     * @access protected
     */
    getTextNodes(cb) {
        let val = "",
            nodes = [];
        this.iterator.forEachNode(NodeFilter.SHOW_TEXT, node => {
            nodes.push({
                start: val.length,
                end: (val += node.textContent).length,
                node
            });
        }, node => {
            if(this.matchesExclude(node.parentNode, true)) {
                return NodeFilter.FILTER_REJECT;
            } else {
                return NodeFilter.FILTER_ACCEPT;
            }
        }, () => {
            cb({
                value: val,
                nodes: nodes
            });
        });
    }

    /**
     * Checks if an element matches any of the specified exclude selectors. Also
     * it checks for elements in which no marks should be performed (e.g.
     * script and style tags) and optionally already marked elements
     * @param  {HTMLElement} el - The element to check
     * @param {boolean} exclM - If already marked elements should be excluded
     * too
     * @return {boolean}
     * @access protected
     */
    matchesExclude(el, exclM) {
        let remain = true;
        let excl = this.opt.exclude.concat([
            // ignores the elements itself, not their childrens (selector *)
            "script", "style", "title", "head", "html"
        ]);
        if(exclM) {
            excl = excl.concat(["*[data-markjs='true']"]);
        }
        excl.every(sel => {
            if(DOMIterator.matches(el, sel)) {
                return remain = false;
            }
            return true;
        });
        return !remain;
    }

    /**
     * Wraps the instance element and class around matches that fit the start
     * and end positions within the node
     * @param  {HTMLElement} node - The DOM text node
     * @param  {number} start - The position where to start wrapping
     * @param  {number} end - The position where to end wrapping
     * @return {HTMLElement} Returns the splitted text node that will appear
     * after the wrapped text node
     * @access protected
     */
    wrapRangeInTextNode(node, start, end) {
        const hEl = !this.opt.element ? "mark" : this.opt.element,
            startNode = node.splitText(start),
            ret = startNode.splitText(end - start);
        let repl = document.createElement(hEl);
        repl.setAttribute("data-markjs", "true");
        if(this.opt.className) {
            repl.setAttribute("class", this.opt.className);
        }
        repl.textContent = startNode.textContent;
        startNode.parentNode.replaceChild(repl, startNode);
        return ret;
    }

    /**
     * @typedef Mark~wrapRangeInMappedTextNodeDict
     * @type {object.<string>}
     * @property {string} value - The composite value of all text nodes
     * @property {object[]} nodes - An array of objects
     * @property {number} nodes.start - The start position within the composite
     * value
     * @property {number} nodes.end - The end position within the composite
     * value
     * @property {HTMLElement} nodes.node - The DOM text node element
     */
    /**
     * Each callback
     * @callback Mark~wrapMatchesEachCallback
     * @param {HTMLElement} node - The wrapped DOM element
     * @param {number} lastIndex - The last matching position within the
     * composite value of text nodes
     */
    /**
     * Filter callback
     * @callback Mark~wrapMatchesFilterCallback
     * @param {HTMLElement} node - The matching text node DOM element
     */
    /**
     * Determines matches by start and end positions using the text node
     * dictionary even across text nodes and calls
     * {@link Mark#wrapRangeInTextNode} to wrap them
     * @param  {Mark~wrapRangeInMappedTextNodeDict} dict - The dictionary
     * @param  {number} start - The start position of the match
     * @param  {number} end - The end position of the match
     * @param  {Mark~wrapMatchesFilterCallback} filterCb - Filter callback
     * @param  {Mark~wrapMatchesEachCallback} eachCb - Each callback
     * @access protected
     */
    wrapRangeInMappedTextNode(dict, start, end, filterCb, eachCb) {
        // iterate over all text nodes to find the one matching the positions
        dict.nodes.every((n, i) => {
            const sibl = dict.nodes[i + 1];
            if(typeof sibl === "undefined" || sibl.start > start) {
                // map range from dict.value to text node
                const s = start - n.start,
                    e = (end > n.end ? n.end : end) - n.start;
                if(filterCb(n.node)) {
                    n.node = this.wrapRangeInTextNode(n.node, s, e);
                    // recalculate positions to also find subsequent matches in
                    // the same text node. Necessary as the text node in dict
                    // now only contains the splitted part after the wrapped one
                    const startStr = dict.value.substr(0, n.start),
                        endStr = dict.value.substr(e + n.start);
                    dict.value = startStr + endStr;
                    dict.nodes.forEach((k, j) => {
                        if(j >= i) {
                            if(dict.nodes[j].start > 0 && j !== i) {
                                dict.nodes[j].start -= e;
                            }
                            dict.nodes[j].end -= e;
                        }
                    });
                    end -= e;
                    eachCb(n.node.previousSibling, n.start);
                    if(end > n.end) {
                        start = n.end;
                    } else {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    /**
     * Filter callback before each wrapping
     * @callback Mark~wrapMatchesFilterCallback
     * @param {string} match - The matching string
     * @param {HTMLElement} node - The text node where the match occurs
     */
    /**
     * Callback for each wrapped element
     * @callback Mark~wrapMatchesEachCallback
     * @param {HTMLElement} element - The marked DOM element
     */
    /**
     * Callback on end
     * @callback Mark~wrapMatchesEndCallback
     */
    /**
     * Wraps the instance element and class around matches within single HTML
     * elements in all contexts
     * @param {RegExp} regex - The regular expression to be searched for
     * @param {boolean} custom - If false, the function expects a regular
     * expression that has at least two groups (like returned from
     * {@link Mark#createAccuracyRegExp}). The first group will be ignored and
     * the second will be wrapped
     * @param {Mark~wrapMatchesEachCallback} eachCb
     * @param {Mark~wrapMatchesFilterCallback} filterCb
     * @param {Mark~wrapMatchesEndCallback} endCb
     * @access protected
     */
    wrapMatches(regex, custom, filterCb, eachCb, endCb) {
        const matchIdx = custom ? 0 : 2;
        this.getTextNodes(dict => {
            dict.nodes.forEach(node => {
                node = node.node;
                let match;
                while((match = regex.exec(node.textContent)) !== null) {
                    if(!filterCb(match[matchIdx], node)) {
                        continue;
                    }
                    let pos = match.index;
                    if(!custom) {
                        pos += match[matchIdx - 1].length;
                    }
                    node = this.wrapRangeInTextNode(
                        node,
                        pos,
                        pos + match[matchIdx].length
                    );
                    eachCb(node.previousSibling);
                    // reset index of last match as the node changed and the
                    // index isn't valid anymore http://tinyurl.com/htsudjd
                    regex.lastIndex = 0;
                }
            });
            endCb();
        });
    }

    /**
     * Callback for each wrapped element
     * @callback Mark~wrapMatchesAcrossElementsEachCallback
     * @param {HTMLElement} element - The marked DOM element
     */
    /**
     * Filter callback before each wrapping
     * @callback Mark~wrapMatchesAcrossElementsFilterCallback
     * @param {string} match - The matching string
     * @param {HTMLElement} node - The text node where the match occurs
     */
    /**
     * Callback on end
     * @callback Mark~wrapMatchesAcrossElementsEndCallback
     */
    /**
     * Wraps the instance element and class around matches across all HTML
     * elements in all contexts
     * @param {RegExp} regex - The regular expression to be searched for
     * @param {boolean} custom - If false, the function expects a regular
     * expression that has at least two groups (like returned from
     * {@link Mark#createAccuracyRegExp}). The first group will be ignored and
     * the second will be wrapped
     * @param {Mark~wrapMatchesAcrossElementsEachCallback} eachCb
     * @param {Mark~wrapMatchesAcrossElementsFilterCallback} filterCb
     * @param {Mark~wrapMatchesAcrossElementsEndCallback} endCb
     * @access protected
     */
    wrapMatchesAcrossElements(regex, custom, filterCb, eachCb, endCb) {
        const matchIdx = custom ? 0 : 2;
        this.getTextNodes(dict => {
            let match;
            while((match = regex.exec(dict.value)) !== null) {
                // calculate range inside dict.value
                let start = match.index;
                if(!custom) {
                    start += match[matchIdx - 1].length;
                }
                const end = start + match[matchIdx].length;
                // note that dict will be updated automatically, as it'll change
                // in the wrapping process, due to the fact that text
                // nodes will be splitted
                this.wrapRangeInMappedTextNode(dict, start, end, node => {
                    return filterCb(match[matchIdx], node);
                }, (node, lastIndex) => {
                    regex.lastIndex = lastIndex;
                    eachCb(node);
                });
            }
            endCb();
        });
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
        let fn = "wrapMatches";
        if(this.opt.acrossElements) {
            fn = "wrapMatchesAcrossElements";
        }
        this[fn](regexp, true, (match, node) => {
            return this.opt.filter(node, match, totalMatches);
        }, eachCb, () => {
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
     * @property {boolean} [acrossElements=false] - Whether to find matches
     * across HTML elements. By default, only matches within single HTML
     * elements will be found
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
        let totalMatches = 0,
            fn = "wrapMatches";
        if(this.opt.acrossElements) {
            fn = "wrapMatchesAcrossElements";
        }
        if(kwArrLen === 0) {
            this.opt.done(totalMatches);
            return;
        }
        const handler = kw => { // async function calls as iframes are async too
            let regex = new RegExp(this.createRegExp(kw), "gmi"),
                matches = 0;
            this.log(`Searching with expression "${regex}"`);
            this[fn](regex, false, (term, node) => {
                return this.opt.filter(node, kw, matches, totalMatches);
            }, element => {
                matches++;
                totalMatches++;
                this.opt.each(element);
            }, () => {
                if(matches === 0) {
                    this.opt.noMatch(kw);
                }
                if(kwArr[kwArrLen - 1] === kw) {
                    this.opt.done(totalMatches);
                } else {
                    handler(kwArr[kwArr.indexOf(kw) + 1]);
                }
            });
        };
        handler(kwArr[0]);
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
        this.iterator.forEachNode(NodeFilter.SHOW_ELEMENT, node => {
            this.unwrapMatches(node);
        }, node => {
            const matchesSel = DOMIterator.matches(node, sel),
                matchesExclude = this.matchesExclude(node, false);
            if(!matchesSel || matchesExclude) {
                return NodeFilter.FILTER_REJECT;
            } else {
                return NodeFilter.FILTER_ACCEPT;
            }
        }, this.opt.done);
    }
}

/**
 * A NodeIterator with iframes support and a method to check if an element is
 * matching a specified selector
 * @example
 * const iterator = new DOMIterator(
 *     document.querySelector("#context"), true
 * );
 * iterator.forEachNode(NodeFilter.SHOW_TEXT, node => {
 *     console.log(node);
 * }, node => {
 *     if(DOMIterator.matches(node.parentNode, ".ignore")){
 *         return NodeFilter.FILTER_REJECT;
 *     } else {
 *         return NodeFilter.FILTER_ACCEPT;
 *     }
 * }, () => {
 *     console.log("DONE");
 * });
 * @todo Outsource into separate repository and include it in the build
 */
class DOMIterator {

    /**
     * @param {HTMLElement|HTMLElement[]|NodeList} ctx - The context DOM
     * element, an array of DOM elements or a NodeList
     * @param {boolean} [iframes=true] - A boolean indicating if iframes should
     * be handled
     */
    constructor(ctx, iframes = true) {
        /**
         * The context
         * @type {HTMLElement|HTMLElement[]|NodeList}
         * @access protected
         */
        this.ctx = ctx;
        /**
         * Boolean indicating if iframe support is enabled
         * @type {boolean}
         * @access protected
         */
        this.iframes = iframes;
    }

    /**
     * Returns all contexts filtered by duplicates (even nested)
     * @return [HTMLElement[]] - An array containing DOM contexts
     * @access protected
     */
    getContexts() {
        let ctx;
        if(typeof this.ctx === "undefined" || !this.ctx) { // e.g. null
            ctx = [];
        } else if(NodeList.prototype.isPrototypeOf(this.ctx)) {
            ctx = Array.prototype.slice.call(this.ctx);
        } else if(Array.isArray(this.ctx)) {
            ctx = this.ctx;
        } else { // e.g. HTMLElement or element inside iframe
            ctx = [this.ctx];
        }
        // filter duplicate text nodes
        let filteredCtx = [];
        ctx.forEach(ctx => {
            const isDescendant = filteredCtx.filter(contexts => {
                return contexts.contains(ctx);
            }).length > 0;
            if(filteredCtx.indexOf(ctx) === -1 && !isDescendant) {
                filteredCtx.push(ctx);
            }
        });
        return filteredCtx;
    }

    /**
     * Checks if the specified DOM element matches the selector
     * @param  {HTMLElement} el - The DOM element
     * @param  {string} selector - The selector
     * @return {boolean}
     * @access public
     */
    static matches(el, selector) {
        const fn = (
            el.matches ||
            el.matchesSelector ||
            el.msMatchesSelector ||
            el.mozMatchesSelector ||
            el.oMatchesSelector ||
            el.webkitMatchesSelector
        );
        if(fn) {
            return fn.call(el, selector);
        } else { // may occur e.g. when el is a textNode
            return false;
        }
    }

    /**
     * @callback DOMIterator~getIframeContentsSuccessCallback
     * @param {HTMLDocument} contents - The contentDocument of the iframe
     */
    /**
     * Calls the success callback function with the iframe document. If it can't
     * be accessed it calls the error callback function
     * @param {DOMIterator~getIframeContentsSuccessCallback} successFn
     * @param {function} [errorFn]
     * @access protected
     */
    getIframeContents(ifr, successFn, errorFn = () => {}) {
        let doc;
        try {
            const ifrWin = ifr.contentWindow;
            doc = ifrWin.document;
            if(!ifrWin || !doc) { // no permission = null. Undefined in Phantom
                throw new Error("iframe inaccessible");
            }
        } catch(e) {
            errorFn();
        }
        if(doc) {
            successFn(doc);
        }
    }

    /**
     * Callback when the iframe is ready
     * @callback DOMIterator~onIframeReadySuccessCallback
     * @param {HTMLDocument} contents - The contentDocument of the iframe
     */
    /**
     * Callback if the iframe can't be accessed
     * @callback DOMIterator~onIframeReadyErrorCallback
     */
    /**
     * Calls the callback if the specified iframe is ready for DOM access
     * @param  {HTMLElement} ifr - The iframe DOM element
     * @param  {DOMIterator~onIframeReadySuccessCallback} successFn - Success callback
     * @param {DOMIterator~onIframeReadyErrorCallback} errorFn - Error callback
     * @see {@link http://stackoverflow.com/a/36155560/3894981} for
     * background information
     * @access protected
     */
    onIframeReady(ifr, successFn, errorFn) {
        try {
            const ifrWin = ifr.contentWindow,
                bl = "about:blank",
                compl = "complete",
                isBlank = () => {
                    const src = ifr.getAttribute("src").trim(),
                        href = ifrWin.location.href;
                    return href === bl && src !== bl && src;
                },
                observeOnload = () => {
                    const listener = () => {
                        try {
                            if(!isBlank()) {
                                ifr.removeEventListener("load", listener);
                                this.getIframeContents(ifr, successFn, errorFn);
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
                    this.getIframeContents(ifr, successFn, errorFn);
                }
            } else {
                observeOnload();
            }
        } catch(e) { // accessing contentDocument failed
            errorFn();
        }
    }

    /**
     * Callback allowing to filter an iframe. Must return true when the element
     * should remain, otherwise false
     * @callback DOMIterator~forEachIframeFilterCallback
     * @param {HTMLElement} iframe - The iframe DOM element
     */
    /**
     * Callback for each iframe content
     * @callback DOMIterator~forEachIframeEachCallback
     * @param {HTMLElement} content - The iframe document
     */
    /**
     * Callback if all iframes inside the context were handled
     * @callback DOMIterator~forEachIframeEndCallback
     * @param {number} handled - The number of handled iframes (those who
     * wheren't filtered)
     */
    /**
     * Iterates over all iframes inside the specified context and calls the
     * callbacks when they're ready
     * @param {HTMLElement} ctx - The context DOM element
     * @param {DOMIterator~forEachIframeFilterCallback} filter - Filter callback
     * @param {DOMIterator~forEachIframeEachCallback} each - Each callback
     * @param {DOMIterator~forEachIframeEndCallback} end - End callback
     * @access protected
     */
    forEachIframe(ctx, filter, each, end) {
        let ifr = ctx.querySelectorAll("iframe"),
            open = ifr.length,
            handled = 0;
        ifr = Array.prototype.slice.call(ifr);
        const checkEnd = () => {
            if(--open <= 0) {
                end(handled);
            }
        };
        if(!open) {
            checkEnd();
        }
        ifr.forEach(ifr => {
            this.onIframeReady(ifr, con => {
                if(filter(ifr)) {
                    handled++;
                    each(con);
                }
                checkEnd();
            }, checkEnd);
        });
    }

    /**
     * Creates a NodeIterator on the specified context
     * @see {@link https://developer.mozilla.org/en/docs/Web/API/NodeIterator}
     * @param {HTMLElement} ctx - The context DOM element
     * @param {DOMIterator~whatToShow} whatToShow
     * @param {DOMIterator~filterCb} filter
     * @return {NodeIterator}
     * @access protected
     */
    createIterator(ctx, whatToShow, filter) {
        return document.createNodeIterator(ctx, whatToShow, filter, false);
    }

    /**
     * Creates an instance of DOMIterator in an iframe
     * @param {HTMLDocument} contents - Iframe document
     * @return {DOMIterator}
     * @access protected
     */
    createInstanceOnIframe(contents) {
        contents = contents.querySelector("html");
        return new DOMIterator(contents, this.iframes);
    }

    /**
     * Checks if an iframe occurs between two nodes, more specifically if an
     * iframe occurs before the specified node and after the specified prevNode
     * @param {HTMLElement} node - The node that should occur after the iframe
     * @param {HTMLElement} prevNode - The node that should occur before the
     * iframe
     * @param {HTMLElement} iframe - The iframe to check against
     * @return {boolean}
     * @access protected
     */
    compareNodeIframe(node, prevNode, ifr) {
        const compCurr = node.compareDocumentPosition(ifr),
            prev = Node.DOCUMENT_POSITION_PRECEDING;
        if(compCurr & prev) {
            if(prevNode !== null) {
                const compPrev = prevNode.compareDocumentPosition(ifr),
                    after = Node.DOCUMENT_POSITION_FOLLOWING;
                if(compPrev & after) {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }

    /**
     * @typedef {DOMIterator~getIteratorNodeReturn}
     * @type {object.<string>}
     * @property {HTMLElement} prevNode - The previous node or null if there is
     * no
     * @property {HTMLElement} node - The current node
     */
    /**
     * Returns the previous and current node of the specified iterator
     * @param {NodeIterator} - The iterator
     * @return DOMIterator~getIteratorNodeReturn
     * @access protected
     */
    getIteratorNode(itr) {
        const prevNode = itr.previousNode();
        let node;
        if(prevNode === null) {
            node = itr.nextNode();
        } else {
            node = itr.nextNode() && itr.nextNode();
        }
        return {
            prevNode,
            node
        };
    }

    /**
     * Checks if an iframe wasn't handled already and if so, calls
     * {@link DOMIterator#compareNodeIframe} to check if it should be handled.
     * Information wheter an iframe was or wasn't handled is given within the
     * <code>ifr</code> dictionary
     * @param {HTMLElement} node - The node that should occur after the iframe
     * @param {HTMLElement} prevNode - The node that should occur before the
     * iframe
     * @param {HTMLElement} currIFr - The iframe to check
     * @param {DOMIterator~iterateThroughNodesIfr} - The iframe dictionary. Will
     * be manipulated (by reference)
     * @return {boolean} Returns true when it should be handled, otherwise false
     * @access protected
     */
    checkIframeFilter(node, prevNode, currIfr, ifr) {
        let key = false, // false === doesn't exist
            handled = false;
        ifr.forEach((ifrDict, i) => {
            if(ifrDict.val === currIfr) {
                key = i;
                handled = ifrDict.handled;
            }
        });
        if(this.compareNodeIframe(node, prevNode, currIfr)) {
            if(key === false && !handled) {
                ifr.push({
                    val: currIfr,
                    handled: true
                });
            } else if(key !== false && !handled) {
                ifr[key].handled = true;
            }
            return true;
        }
        if(key === false) {
            ifr.push({
                val: currIfr,
                handled: false
            });
        }
        return false;
    }

    /**
     * Creates an iterator on all open iframes in the specified array and calls
     * the end callback when finished
     * @param {DOMIterator~iterateThroughNodesIfr} ifr
     * @param {DOMIterator~whatToShow} whatToShow
     * @param  {DOMIterator~forEachNodeCallback} eCb - Each callback
     * @param {DOMIterator~filterCb} fCb
     * @param {DOMIterator~forEachNodeEndCallback} endCb - End callback
     * @access protected
     */
    handleOpenIframes(ifr, whatToShow, eCb, fCb, endCb) {
        let endAlreadyCalled = false;
        ifr.forEach(ifrDict => {
            if(!ifrDict.handled) {
                endAlreadyCalled = true;
                this.getIframeContents(ifrDict.val, c => {
                    this.createInstanceOnIframe(c).forEachNode(
                        whatToShow, eCb, fCb, endCb
                    );
                });
            }
        });
        if(!endAlreadyCalled) {
            endCb();
        }
    }

    /**
     * An array containing objects. The object key "val" contains an iframe
     * DOM element. The object key "handled" contains a boolean indicating if
     * the iframe was handled already.
     * It wouldn't be enough to save all open or all already handled iframes.
     * The information of open iframes is necessary because they may occur after
     * all other text nodes (and compareNodeIframe would never be true). The
     * information of already handled iframes is necessary as otherwise they may
     * be handled multiple times
     * @typedef DOMIterator~iterateThroughNodesIfr
     * @type {object[]}
     */
    /**
     * Iterates through all nodes in the specified context and handles iframe
     * nodes at the correct position
     * @param {DOMIterator~whatToShow} whatToShow
     * @param {HTMLElement} ctx - The context
     * @param  {DOMIterator~forEachNodeCallback} eCb - Each callback
     * @param {DOMIterator~filterCb} fCb
     * @param {DOMIterator~forEachNodeEndCallback} endCb - End callback
     * @param {NodeIterator} itr - A NodeIterator that will be set in recursive
     * calls
     * @param {DOMIterator~iterateThroughNodesIfr} ifr - An array of iframes
     * that will be passed in recursive calls
     * @access protected
     */
    iterateThroughNodes(whatToShow, ctx, eCb, fCb, endCb, itr, ifr = []) {
        itr = !itr ? this.createIterator(ctx, whatToShow, fCb) : itr;
        const {
            prevNode,
            node
        } = this.getIteratorNode(itr),
            done = () => {
                if(node !== null) { // In case all elements were filtered
                    eCb(node);
                }
                if(itr.nextNode()) {
                    itr.previousNode(); // reset iterator
                    this.iterateThroughNodes(
                        whatToShow, ctx, eCb, fCb, endCb, itr, ifr
                    );
                } else {
                    this.handleOpenIframes(ifr, whatToShow, eCb, fCb, endCb);
                }
            };
        if(!this.iframes) {
            done();
        } else {
            this.forEachIframe(ctx, currIfr => {
                // note that ifr will be manipulated within the following method
                return this.checkIframeFilter(node, prevNode, currIfr, ifr);
            }, con => {
                this.createInstanceOnIframe(con).forEachNode(
                    whatToShow, eCb, fCb, done
                );
            }, handled => {
                if(handled === 0) { // each callback wasn't called
                    done();
                }
            });
        }
    }

    /**
     * Callback for each node
     * @callback DOMIterator~forEachNodeCallback
     * @param {HTMLElement} node - The DOM text node element
     */
    /**
     * Callback if all contexts were handled
     * @callback DOMIterator~forEachNodeEndCallback
     */
    /**
     * Iterates over all contexts and initializes
     * {@link DOMIterator#iterateThroughNodes iterateThroughNodes} on them
     * @param {DOMIterator~whatToShow} whatToShow
     * @param  {DOMIterator~forEachNodeCallback} cb - Each callback
     * @param {DOMIterator~filterCb} filterCb
     * @param {DOMIterator~forEachNodeEndCallback} end - End callback
     * @access public
     */
    forEachNode(whatToShow, cb, filterCb, end = () => {}) {
        const contexts = this.getContexts();
        let open = contexts.length;
        if(!open) {
            end();
        }
        contexts.forEach(ctx => {
            this.iterateThroughNodes(whatToShow, ctx, cb, filterCb, () => {
                // call end only if all contexts were handled
                if(--open <= 0) {
                    end();
                }
            });
        });
    }

    /**
     * Callback to filter nodes. Can return e.g. NodeFilter.FILTER_ACCEPT or
     * NodeFilter.FILTER_REJECT
     * @see {@link http://tinyurl.com/zdczmm2}
     * @callback DOMIterator~filterCb
     * @param {HTMLElement} node - The node to filter
     */
    /**
     * @typedef DOMIterator~whatToShow
     * @see {@link http://tinyurl.com/zfqqkx2}
     * @type {number}
     */
}
