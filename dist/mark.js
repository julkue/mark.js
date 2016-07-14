/*!***************************************************
 * mark.js v8.0.0
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/

"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (factory, window, document) {
    if (typeof define === "function" && define.amd) {
        define([], function () {
            return factory(window, document);
        });
    } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.exports) {
        module.exports = factory(window, document);
    } else {
        factory(window, document);
    }
})(function (window, document) {
    var Mark = function () {
        function Mark(ctx) {
            _classCallCheck(this, Mark);

            this.ctx = ctx;
        }

        _createClass(Mark, [{
            key: "log",
            value: function log(msg) {
                var level = arguments.length <= 1 || arguments[1] === undefined ? "debug" : arguments[1];

                var log = this.opt.log;
                if (!this.opt.debug) {
                    return;
                }
                if ((typeof log === "undefined" ? "undefined" : _typeof(log)) === "object" && typeof log[level] === "function") {
                    log[level]("mark.js: " + msg);
                }
            }
        }, {
            key: "escapeStr",
            value: function escapeStr(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            }
        }, {
            key: "createRegExp",
            value: function createRegExp(str) {
                str = this.escapeStr(str);
                if (Object.keys(this.opt.synonyms).length) {
                    str = this.createSynonymsRegExp(str);
                }
                if (this.opt.diacritics) {
                    str = this.createDiacriticsRegExp(str);
                }
                str = this.createMergedBlanksRegExp(str);
                str = this.createAccuracyRegExp(str);
                return str;
            }
        }, {
            key: "createSynonymsRegExp",
            value: function createSynonymsRegExp(str) {
                var syn = this.opt.synonyms;
                for (var index in syn) {
                    if (syn.hasOwnProperty(index)) {
                        var value = syn[index],
                            k1 = this.escapeStr(index),
                            k2 = this.escapeStr(value);
                        str = str.replace(new RegExp("(" + k1 + "|" + k2 + ")", "gmi"), "(" + k1 + "|" + k2 + ")");
                    }
                }
                return str;
            }
        }, {
            key: "createDiacriticsRegExp",
            value: function createDiacriticsRegExp(str) {
                var dct = ["aÀÁÂÃÄÅàáâãäåĀāąĄ", "cÇçćĆčČ", "dđĐďĎ", "eÈÉÊËèéêëěĚĒēęĘ", "iÌÍÎÏìíîïĪī", "lłŁ", "nÑñňŇńŃ", "oÒÓÔÕÕÖØòóôõöøŌō", "rřŘ", "sŠšśŚ", "tťŤ", "uÙÚÛÜùúûüůŮŪū", "yŸÿýÝ", "zŽžżŻźŹ"];
                var handled = [];
                str.split("").forEach(function (ch) {
                    dct.every(function (dct) {
                        if (dct.indexOf(ch) !== -1) {
                            if (handled.indexOf(dct) > -1) {
                                return false;
                            }

                            str = str.replace(new RegExp("[" + dct + "]", "gmi"), "[" + dct + "]");
                            handled.push(dct);
                        }
                        return true;
                    });
                });
                return str;
            }
        }, {
            key: "createMergedBlanksRegExp",
            value: function createMergedBlanksRegExp(str) {
                return str.replace(/[\s]+/gmi, "[\\s]*");
            }
        }, {
            key: "createAccuracyRegExp",
            value: function createAccuracyRegExp(str) {
                var _this = this;

                var acc = this.opt.accuracy,
                    val = typeof acc === "string" ? acc : acc.value,
                    ls = typeof acc === "string" ? [] : acc.limiters,
                    lsJoin = "";
                ls.forEach(function (limiter) {
                    lsJoin += "|" + _this.escapeStr(limiter);
                });
                switch (val) {
                    case "partially":
                        return "()(" + str + ")";
                    case "complementary":
                        return "()([^\\s" + lsJoin + "]*" + str + "[^\\s" + lsJoin + "]*)";
                    case "exactly":
                        return "(^|\\s" + lsJoin + ")(" + str + ")(?=$|\\s" + lsJoin + ")";
                }
            }
        }, {
            key: "getSeparatedKeywords",
            value: function getSeparatedKeywords(sv) {
                var _this2 = this;

                var stack = [];
                sv.forEach(function (kw) {
                    if (!_this2.opt.separateWordSearch) {
                        if (kw.trim()) {
                            stack.push(kw);
                        }
                    } else {
                        kw.split(" ").forEach(function (kwSplitted) {
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
        }, {
            key: "getContexts",
            value: function getContexts() {
                var ctx = void 0;
                if (typeof this.ctx === "undefined") {
                    ctx = [];
                } else if (this.ctx instanceof HTMLElement) {
                    ctx = [this.ctx];
                } else if (Array.isArray(this.ctx)) {
                    ctx = this.ctx;
                } else {
                    ctx = Array.prototype.slice.call(this.ctx);
                }
                if (!ctx.length) {
                    this.log("Empty context", "warn");
                }
                return ctx;
            }
        }, {
            key: "matches",
            value: function matches(el, selector) {
                return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
            }
        }, {
            key: "matchesExclude",
            value: function matchesExclude(el, exclM) {
                var _this3 = this;

                var remain = true;
                var excl = this.opt.exclude.concat(["script", "style", "title"]);
                if (exclM) {
                    excl = excl.concat(["*[data-markjs='true']"]);
                }
                excl.every(function (sel) {
                    if (_this3.matches(el, sel)) {
                        return remain = false;
                    }
                    return true;
                });
                return !remain;
            }
        }, {
            key: "onIframeReady",
            value: function onIframeReady(ifr, successFn, errorFn) {
                try {
                    (function () {
                        var ifrWin = ifr.contentWindow,
                            bl = "about:blank",
                            compl = "complete";
                        var callCallback = function callCallback() {
                            try {
                                if (ifrWin.document === null) {
                                    throw new Error("iframe inaccessible");
                                }
                                successFn(ifrWin.document);
                            } catch (e) {
                                errorFn();
                            }
                        };
                        var isBlank = function isBlank() {
                            var src = ifr.getAttribute("src").trim(),
                                href = ifrWin.location.href;
                            return href === bl && src !== bl && src;
                        };
                        var observeOnload = function observeOnload() {
                            var listener = function listener() {
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
                    })();
                } catch (e) {
                    errorFn();
                }
            }
        }, {
            key: "forEachIframe",
            value: function forEachIframe(ctx, cb, end) {
                var _this4 = this;

                var ifr = ctx.querySelectorAll("iframe");
                ifr = Array.prototype.slice.call(ifr);
                if (ifr.length) {
                    ifr.forEach(function (ifr) {
                        _this4.onIframeReady(ifr, function (con) {
                            var html = con.querySelector("html");
                            _this4.forEachIframe(html, cb, function () {
                                cb(html);
                                end();
                            });
                        }, function () {
                            var src = ifr.getAttribute("src");
                            _this4.log("iframe \"" + src + "\" could not be accessed", "warn");
                            end();
                        });
                    });
                } else {
                    end();
                }
            }
        }, {
            key: "forEachContext",
            value: function forEachContext(cb, end) {
                var _this5 = this;

                var ctx = this.getContexts(),
                    callCallbacks = function callCallbacks(el) {
                    cb(el);
                    if (--open < 1) {
                        end();
                    }
                };
                var open = ctx.length;
                if (open < 1) {
                    end();
                }
                ctx.forEach(function (el) {
                    if (_this5.opt.iframes) {
                        _this5.forEachIframe(el, cb, function () {
                            callCallbacks(el);
                        });
                    } else {
                        callCallbacks(el);
                    }
                });
            }
        }, {
            key: "forEachTextNode",
            value: function forEachTextNode(cb, end) {
                var _this6 = this;

                var handled = [];
                this.forEachContext(function (ctx) {
                    var isDescendant = handled.filter(function (handledCtx) {
                        return handledCtx.contains(ctx);
                    }).length > 0;
                    if (handled.indexOf(ctx) > -1 || isDescendant) {
                        return;
                    }
                    handled.push(ctx);
                    var itr = document.createNodeIterator(ctx, NodeFilter.SHOW_TEXT, function (node) {
                        if (!_this6.matchesExclude(node.parentNode, true)) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_REJECT;
                    }, false);
                    var node = void 0;
                    while (node = itr.nextNode()) {
                        cb(node);
                    }
                }, end);
            }
        }, {
            key: "wrapMatches",
            value: function wrapMatches(node, regex, custom, filterCb, eachCb) {
                var hEl = !this.opt.element ? "mark" : this.opt.element,
                    index = custom ? 0 : 2;
                var match = void 0;
                while ((match = regex.exec(node.textContent)) !== null) {
                    if (!filterCb(match[index])) {
                        continue;
                    }

                    var pos = match.index;
                    if (!custom) {
                        pos += match[index - 1].length;
                    }
                    var startNode = node.splitText(pos);

                    node = startNode.splitText(match[index].length);
                    if (startNode.parentNode !== null) {
                        var repl = document.createElement(hEl);
                        repl.setAttribute("data-markjs", "true");
                        if (this.opt.className) {
                            repl.setAttribute("class", this.opt.className);
                        }
                        repl.textContent = match[index];
                        startNode.parentNode.replaceChild(repl, startNode);
                        eachCb(repl);
                    }
                    regex.lastIndex = 0;
                }
            }
        }, {
            key: "unwrapMatches",
            value: function unwrapMatches(node) {
                var parent = node.parentNode;
                var docFrag = document.createDocumentFragment();
                while (node.firstChild) {
                    docFrag.appendChild(node.removeChild(node.firstChild));
                }
                parent.replaceChild(docFrag, node);
                parent.normalize();
            }
        }, {
            key: "markRegExp",
            value: function markRegExp(regexp, opt) {
                var _this7 = this;

                this.opt = opt;
                this.log("Searching with expression \"" + regexp + "\"");
                var totalMatches = 0;
                var eachCb = function eachCb(element) {
                    totalMatches++;
                    _this7.opt.each(element);
                };
                this.forEachTextNode(function (node) {
                    _this7.wrapMatches(node, regexp, true, function (match) {
                        return _this7.opt.filter(node, match, totalMatches);
                    }, eachCb);
                }, function () {
                    if (totalMatches === 0) {
                        _this7.opt.noMatch(regexp);
                    }
                    _this7.opt.done(totalMatches);
                });
            }
        }, {
            key: "mark",
            value: function mark(sv, opt) {
                var _this8 = this;

                this.opt = opt;

                var _getSeparatedKeywords = this.getSeparatedKeywords(typeof sv === "string" ? [sv] : sv);

                var kwArr = _getSeparatedKeywords.keywords;
                var kwArrLen = _getSeparatedKeywords.length;

                var totalMatches = 0;
                if (kwArrLen === 0) {
                    this.opt.done(totalMatches);
                }
                kwArr.forEach(function (kw) {
                    var regex = new RegExp(_this8.createRegExp(kw), "gmi"),
                        matches = 0;
                    var eachCb = function eachCb(element) {
                        matches++;
                        totalMatches++;
                        _this8.opt.each(element);
                    };
                    _this8.log("Searching with expression \"" + regex + "\"");
                    _this8.forEachTextNode(function (node) {
                        _this8.wrapMatches(node, regex, false, function () {
                            return _this8.opt.filter(node, kw, matches, totalMatches);
                        }, eachCb);
                    }, function () {
                        if (matches === 0) {
                            _this8.opt.noMatch(kw);
                        }
                        if (kwArr[kwArrLen - 1] === kw) {
                            _this8.opt.done(totalMatches);
                        }
                    });
                });
            }
        }, {
            key: "unmark",
            value: function unmark(opt) {
                var _this9 = this;

                this.opt = opt;
                var sel = this.opt.element ? this.opt.element : "*";
                sel += "[data-markjs]";
                if (this.opt.className) {
                    sel += "." + this.opt.className;
                }
                this.log("Removal selector \"" + sel + "\"");
                this.forEachContext(function (ctx) {
                    var matches = ctx.querySelectorAll(sel);
                    Array.prototype.slice.call(matches).forEach(function (el) {
                        if (!_this9.matchesExclude(el, false)) {
                            _this9.unwrapMatches(el);
                        }
                    });
                }, this.opt.done);
            }
        }, {
            key: "opt",
            set: function set(val) {
                this._opt = _extends({}, {
                    "element": "",
                    "className": "",
                    "exclude": [],
                    "iframes": false,
                    "separateWordSearch": true,
                    "diacritics": true,
                    "synonyms": {},
                    "accuracy": "partially",
                    "each": function each() {},
                    "noMatch": function noMatch() {},
                    "filter": function filter() {
                        return true;
                    },
                    "done": function done() {},
                    "debug": false,
                    "log": window.console
                }, val);
            },
            get: function get() {
                return this._opt;
            }
        }]);

        return Mark;
    }();

    window.Mark = function (ctx) {
        var _this10 = this;

        var instance = new Mark(ctx);
        this.mark = function (sv, opt) {
            instance.mark(sv, opt);
            return _this10;
        };
        this.markRegExp = function (sv, opt) {
            instance.markRegExp(sv, opt);
            return _this10;
        };
        this.unmark = function (opt) {
            instance.unmark(opt);
            return _this10;
        };
        return this;
    };

    return window.Mark;
}, window, document);
