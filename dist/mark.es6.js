/*!***************************************************
 * mark.js v6.0.0
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/

"use strict";

((factory, window, document) => {
    if (typeof define === "function" && define.amd) {
        define([], () => {
            return factory(window, document);
        });
    } else {
        factory(window, document);
    }
})((window, document) => {
    class Mark {
        constructor(ctx) {
            this.ctx = ctx;
        }

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

        log(msg, level = "debug") {
            const log = this.opt.log;
            if (!this.opt.debug) {
                return;
            }
            if (typeof log === "object" && typeof log[level] === "function") {
                log[level](`mark.js: ${ msg }`);
            }
        }

        escapeStr(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        createRegExp(str) {
            str = this.escapeStr(str);
            if (Object.keys(this.opt.synonyms).length) {
                str = this.createSynonymsRegExp(str);
            }
            if (this.opt.diacritics) {
                str = this.createDiacriticsRegExp(str);
            }
            str = this.createAccuracyRegExp(str);
            return str;
        }

        createSynonymsRegExp(str) {
            const syn = this.opt.synonyms;
            for (let index in syn) {
                if (syn.hasOwnProperty(index)) {
                    const value = syn[index],
                          k1 = this.escapeStr(index),
                          k2 = this.escapeStr(value);
                    str = str.replace(new RegExp(`(${ k1 }|${ k2 })`, "gmi"), `(${ k1 }|${ k2 })`);
                }
            }
            return str;
        }

        createDiacriticsRegExp(str) {
            const dct = ["aÀÁÂÃÄÅàáâãäåĀāąĄ", "cÇçćĆčČ", "dđĐďĎ", "eÈÉÊËèéêëěĚĒēęĘ", "iÌÍÎÏìíîïĪī", "lłŁ", "nÑñňŇńŃ", "oÒÓÔÕÕÖØòóôõöøŌō", "rřŘ", "sŠšśŚ", "tťŤ", "uÙÚÛÜùúûüůŮŪū", "yŸÿýÝ", "zŽžżŻźŹ"];
            let handled = [];
            str.split("").forEach(ch => {
                dct.every(dct => {
                    if (dct.indexOf(ch) !== -1) {
                        if (handled.indexOf(dct) > -1) {
                            return false;
                        }

                        str = str.replace(new RegExp(`[${ dct }]`, "gmi"), `[${ dct }]`);
                        handled.push(dct);
                    }
                    return true;
                });
            });
            return str;
        }

        createAccuracyRegExp(str) {
            switch (this.opt.accuracy) {
                case "partially":
                    return str;
                case "complementary":
                    return `\\S*${ str }\\S*`;
                case "exactly":
                    return `\\b${ str }\\b`;
            }
        }

        getSeparatedKeywords(sv) {
            let stack = [];
            sv.forEach(kw => {
                if (!this.opt.separateWordSearch) {
                    if (kw.trim()) {
                        stack.push(kw);
                    }
                } else {
                    kw.split(" ").forEach(kwSplitted => {
                        if (kwSplitted.trim()) {
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

        getElements() {
            let ctx,
                stack = [];
            if (typeof this.ctx === "undefined") {
                ctx = [];
            } else if (this.ctx instanceof HTMLElement) {
                ctx = [this.ctx];
            } else if (Array.isArray(this.ctx)) {
                ctx = this.ctx;
            } else {
                ctx = Array.prototype.slice.call(this.ctx);
            }
            ctx.forEach(ctx => {
                stack.push(ctx);
                const childs = ctx.querySelectorAll("*");
                if (childs.length) {
                    stack = stack.concat(Array.prototype.slice.call(childs));
                }
            });
            if (!ctx.length) {
                this.log("Empty context", "warn");
            }
            return {
                "elements": stack,
                "length": stack.length
            };
        }

        matches(el, selector) {
            return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
        }

        matchesFilter(el, exclM) {
            let remain = true;
            let fltr = this.opt.filter.concat(["script", "style", "title"]);
            if (!this.opt.iframes) {
                fltr = fltr.concat(["iframe"]);
            }
            if (exclM) {
                fltr = fltr.concat(["*[data-markjs='true']"]);
            }
            fltr.every(filter => {
                if (this.matches(el, filter)) {
                    return remain = false;
                }
                return true;
            });
            return !remain;
        }

        onIframeReady(ifr, successFn, errorFn) {
            try {
                const ifrWin = ifr.contentWindow,
                      bl = "about:blank",
                      compl = "complete";
                const callCallback = () => {
                    try {
                        if (ifrWin.document === null) {
                            throw new Error("iframe inaccessible");
                        }
                        successFn(ifrWin.document);
                    } catch (e) {
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
                            if (!isBlank()) {
                                ifr.removeEventListener("load", listener);
                                callCallback();
                            }
                        } catch (e) {
                            errorFn();
                        }
                    };
                    ifr.addEventListener("load", listener);
                };
                if (ifrWin.document.readyState === compl) {
                    if (isBlank()) {
                        observeOnload();
                    } else {
                        callCallback();
                    }
                } else {
                    observeOnload();
                }
            } catch (e) {
                errorFn();
            }
        }

        forEachElementInIframe(ifr, cb, end = function () {}) {
            let open = 0;
            const checkEnd = () => {
                if (--open < 1) {
                    end();
                }
            };
            this.onIframeReady(ifr, con => {
                const stack = Array.prototype.slice.call(con.querySelectorAll("*"));
                if ((open = stack.length) === 0) {
                    checkEnd();
                }
                stack.forEach(el => {
                    if (el.tagName.toLowerCase() === "iframe") {
                        let j = 0;
                        this.forEachElementInIframe(el, (iel, len) => {
                            cb(iel, len);
                            if (len - 1 === j) {
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
                this.log(`iframe '${ src }' could not be accessed`, "warn");
                checkEnd();
            });
        }

        forEachElement(cb, end = function () {}, exclM = true) {
            let {
                elements: stack,
                length: open
            } = this.getElements();
            const checkEnd = () => {
                if (--open === 0) {
                    end();
                }
            };
            checkEnd(++open);
            stack.forEach(el => {
                if (!this.matchesFilter(el, exclM)) {
                    if (el.tagName.toLowerCase() === "iframe") {
                        this.forEachElementInIframe(el, iel => {
                            if (!this.matchesFilter(iel, exclM)) {
                                cb(iel);
                            }
                        }, checkEnd);
                        return;
                    } else {
                            cb(el);
                        }
                }
                checkEnd();
            });
        }

        forEachNode(cb, end = function () {}) {
            this.forEachElement(n => {
                for (n = n.firstChild; n; n = n.nextSibling) {
                    if (n.nodeType === 3 && n.textContent.trim()) {
                        cb(n);
                    }
                }
            }, end);
        }

        wrapMatches(node, regex) {
            const hEl = !this.opt.element ? "mark" : this.opt.element;
            let match;
            while ((match = regex.exec(node.textContent)) !== null) {
                let startNode = node.splitText(match.index);

                node = startNode.splitText(match[0].length);
                if (startNode.parentNode !== null) {
                    let repl = document.createElement(hEl);
                    repl.setAttribute("data-markjs", "true");
                    if (this.opt.className) {
                        repl.setAttribute("class", this.opt.className);
                    }
                    repl.textContent = match[0];
                    startNode.parentNode.replaceChild(repl, startNode);
                    this.opt.each(repl);
                }
                regex.lastIndex = 0;
            }
        }

        markRegExp(regexp, opt) {
            this.opt = opt;
            this.log(`Searching with expression "${ regexp }"`);
            this.forEachNode(node => {
                this.wrapMatches(node, regexp);
            }, this.opt.complete);
        }

        mark(sv, opt) {
            this.opt = opt;
            sv = typeof sv === "string" ? [sv] : sv;
            let {
                keywords: kwArr,
                length: kwArrLen
            } = this.getSeparatedKeywords(sv);
            if (kwArrLen === 0) {
                this.opt.complete();
            }
            kwArr.forEach(kw => {
                let regex = new RegExp(this.createRegExp(kw), "gmi");
                this.log(`Searching with expression "${ regex }"`);
                this.forEachNode(node => {
                    this.wrapMatches(node, regex);
                }, () => {
                    if (kwArr[kwArrLen - 1] === kw) {
                        this.opt.complete();
                    }
                });
            });
        }

        unmark(opt) {
            this.opt = opt;
            let sel = this.opt.element ? this.opt.element : "*";
            sel += "[data-markjs]";
            if (this.opt.className) {
                sel += `.${ this.opt.className }`;
            }
            this.log(`Removal selector "${ sel }"`);
            this.forEachElement(el => {
                if (this.matches(el, sel)) {
                    const parent = el.parentNode;
                    let docFrag = document.createDocumentFragment();
                    while (el.firstChild) {
                        docFrag.appendChild(el.removeChild(el.firstChild));
                    }
                    parent.replaceChild(docFrag, el);

                    parent.normalize();
                }
            }, this.opt.complete, false);
        }

    }

    window.Mark = function (ctx) {
        const instance = new Mark(ctx);
        this.mark = (sv, opt) => {
            instance.mark(sv, opt);
            return this;
        };
        this.markRegExp = (sv, opt) => {
            instance.markRegExp(sv, opt);
            return this;
        };
        this.unmark = opt => {
            instance.unmark(opt);
            return this;
        };
        return this;
    };

    return window.Mark;
}, window, document);
