/*!***************************************************
 * mark.js v6.0.0
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
        define(["jquery"], function (jQuery) {
            return factory(window, document, jQuery);
        });
    } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
        factory(window, document, require("jquery"));
    } else {
        factory(window, document, jQuery);
    }
})(function (window, document, $) {
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
            key: "createAccuracyRegExp",
            value: function createAccuracyRegExp(str) {
                switch (this.opt.accuracy) {
                    case "partially":
                        return str;
                    case "complementary":
                        return "\\S*" + str + "\\S*";
                    case "exactly":
                        return "\\b" + str + "\\b";
                }
            }
        }, {
            key: "getSeparatedKeywords",
            value: function getSeparatedKeywords(sv) {
                var _this = this;

                var stack = [];
                sv.forEach(function (kw) {
                    if (!_this.opt.separateWordSearch) {
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
            key: "getElements",
            value: function getElements() {
                var ctx = void 0,
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
                ctx.forEach(function (ctx) {
                    stack.push(ctx);
                    var childs = ctx.querySelectorAll("*");
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
        }, {
            key: "matches",
            value: function matches(el, selector) {
                return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
            }
        }, {
            key: "matchesFilter",
            value: function matchesFilter(el, exclM) {
                var _this2 = this;

                var remain = true;
                var fltr = this.opt.filter.concat(["script", "style", "title"]);
                if (!this.opt.iframes) {
                    fltr = fltr.concat(["iframe"]);
                }
                if (exclM) {
                    fltr = fltr.concat(["*[data-markjs='true']"]);
                }
                fltr.every(function (filter) {
                    if (_this2.matches(el, filter)) {
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
            key: "forEachElementInIframe",
            value: function forEachElementInIframe(ifr, cb) {
                var _this3 = this;

                var end = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

                var open = 0;
                var checkEnd = function checkEnd() {
                    if (--open < 1) {
                        end();
                    }
                };
                this.onIframeReady(ifr, function (con) {
                    var stack = Array.prototype.slice.call(con.querySelectorAll("*"));
                    if ((open = stack.length) === 0) {
                        checkEnd();
                    }
                    stack.forEach(function (el) {
                        if (el.tagName.toLowerCase() === "iframe") {
                            (function () {
                                var j = 0;
                                _this3.forEachElementInIframe(el, function (iel, len) {
                                    cb(iel, len);
                                    if (len - 1 === j) {
                                        checkEnd();
                                    }
                                    j++;
                                }, checkEnd);
                            })();
                        } else {
                            cb(el, stack.length);
                            checkEnd();
                        }
                    });
                }, function () {
                    var src = ifr.getAttribute("src");
                    _this3.log("iframe '" + src + "' could not be accessed", "warn");
                    checkEnd();
                });
            }
        }, {
            key: "forEachElement",
            value: function forEachElement(cb) {
                var _this4 = this;

                var end = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
                var exclM = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

                var _getElements = this.getElements();

                var stack = _getElements.elements;
                var open = _getElements.length;

                var checkEnd = function checkEnd() {
                    if (--open === 0) {
                        end();
                    }
                };
                checkEnd(++open);
                stack.forEach(function (el) {
                    if (!_this4.matchesFilter(el, exclM)) {
                        if (el.tagName.toLowerCase() === "iframe") {
                            _this4.forEachElementInIframe(el, function (iel) {
                                if (!_this4.matchesFilter(iel, exclM)) {
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
        }, {
            key: "forEachNode",
            value: function forEachNode(cb) {
                var end = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

                this.forEachElement(function (n) {
                    for (n = n.firstChild; n; n = n.nextSibling) {
                        if (n.nodeType === 3 && n.textContent.trim()) {
                            cb(n);
                        }
                    }
                }, end);
            }
        }, {
            key: "wrapMatches",
            value: function wrapMatches(node, regex) {
                var hEl = !this.opt.element ? "mark" : this.opt.element;
                var match = void 0;
                while ((match = regex.exec(node.textContent)) !== null) {
                    var startNode = node.splitText(match.index);

                    node = startNode.splitText(match[0].length);
                    if (startNode.parentNode !== null) {
                        var repl = document.createElement(hEl);
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
        }, {
            key: "markRegExp",
            value: function markRegExp(regexp, opt) {
                var _this5 = this;

                this.opt = opt;
                this.log("Searching with expression \"" + regexp + "\"");
                this.forEachNode(function (node) {
                    _this5.wrapMatches(node, regexp);
                }, this.opt.complete);
            }
        }, {
            key: "mark",
            value: function mark(sv, opt) {
                var _this6 = this;

                this.opt = opt;
                sv = typeof sv === "string" ? [sv] : sv;

                var _getSeparatedKeywords = this.getSeparatedKeywords(sv);

                var kwArr = _getSeparatedKeywords.keywords;
                var kwArrLen = _getSeparatedKeywords.length;

                if (kwArrLen === 0) {
                    this.opt.complete();
                }
                kwArr.forEach(function (kw) {
                    var regex = new RegExp(_this6.createRegExp(kw), "gmi");
                    _this6.log("Searching with expression \"" + regex + "\"");
                    _this6.forEachNode(function (node) {
                        _this6.wrapMatches(node, regex);
                    }, function () {
                        if (kwArr[kwArrLen - 1] === kw) {
                            _this6.opt.complete();
                        }
                    });
                });
            }
        }, {
            key: "unmark",
            value: function unmark(opt) {
                var _this7 = this;

                this.opt = opt;
                var sel = this.opt.element ? this.opt.element : "*";
                sel += "[data-markjs]";
                if (this.opt.className) {
                    sel += "." + this.opt.className;
                }
                this.log("Removal selector \"" + sel + "\"");
                this.forEachElement(function (el) {
                    if (_this7.matches(el, sel)) {
                        var parent = el.parentNode;
                        var docFrag = document.createDocumentFragment();
                        while (el.firstChild) {
                            docFrag.appendChild(el.removeChild(el.firstChild));
                        }
                        parent.replaceChild(docFrag, el);

                        parent.normalize();
                    }
                }, this.opt.complete, false);
            }
        }, {
            key: "opt",
            set: function set(val) {
                this._opt = _extends({}, {
                    "element": "",
                    "className": "",
                    "filter": [],
                    "iframes": false,
                    "separateWordSearch": true,
                    "diacritics": true,
                    "synonyms": {},
                    "accuracy": "partially",
                    "each": function each() {},
                    "complete": function complete() {},
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

    $.fn.mark = function (sv, opt) {
        new Mark(this).mark(sv, opt);
        return this;
    };
    $.fn.markRegExp = function (regexp, opt) {
        new Mark(this).markRegExp(regexp, opt);
        return this;
    };
    $.fn.unmark = function (opt) {
        new Mark(this).unmark(opt);
        return this;
    };
}, window, document);
