/*!***************************************************
* mark.js v9.0.0
* https://markjs.io/
* Copyright (c) 2014–2022, Julian Kühnel
* Released under the MIT license https://git.io/vwTVl
*****************************************************/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global.Mark = factory(global.jQuery));
}(this, (function ($) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  var DOMIterator = /*#__PURE__*/function () {
    function DOMIterator(ctx) {
      var iframes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var exclude = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var iframesTimeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5000;

      _classCallCheck(this, DOMIterator);

      this.ctx = ctx;
      this.iframes = iframes;
      this.exclude = exclude;
      this.iframesTimeout = iframesTimeout;
    }

    _createClass(DOMIterator, [{
      key: "getContexts",
      value: function getContexts() {
        var ctx,
            filteredCtx = [];

        if (typeof this.ctx === 'undefined' || !this.ctx) {
          ctx = [];
        } else if (NodeList.prototype.isPrototypeOf(this.ctx)) {
          ctx = Array.prototype.slice.call(this.ctx);
        } else if (Array.isArray(this.ctx)) {
          ctx = this.ctx;
        } else if (typeof this.ctx === 'string') {
          ctx = Array.prototype.slice.call(document.querySelectorAll(this.ctx));
        } else {
          ctx = [this.ctx];
        }

        ctx.forEach(function (ctx) {
          var isDescendant = filteredCtx.filter(function (contexts) {
            return contexts.contains(ctx);
          }).length > 0;

          if (filteredCtx.indexOf(ctx) === -1 && !isDescendant) {
            filteredCtx.push(ctx);
          }
        });
        return filteredCtx;
      }
    }, {
      key: "getIframeContents",
      value: function getIframeContents(ifr, successFn) {
        var errorFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
        var doc;

        try {
          var ifrWin = ifr.contentWindow;
          doc = ifrWin.document;

          if (!ifrWin || !doc) {
            throw new Error('iframe inaccessible');
          }
        } catch (e) {
          errorFn();
        }

        if (doc) {
          successFn(doc);
        }
      }
    }, {
      key: "isIframeBlank",
      value: function isIframeBlank(ifr) {
        var bl = 'about:blank',
            src = ifr.getAttribute('src').trim(),
            href = ifr.contentWindow.location.href;
        return href === bl && src !== bl && src;
      }
    }, {
      key: "observeIframeLoad",
      value: function observeIframeLoad(ifr, successFn, errorFn) {
        var _this = this;

        var called = false,
            tout = null;

        var listener = function listener() {
          if (called) {
            return;
          }

          called = true;
          clearTimeout(tout);

          try {
            if (!_this.isIframeBlank(ifr)) {
              ifr.removeEventListener('load', listener);

              _this.getIframeContents(ifr, successFn, errorFn);
            }
          } catch (e) {
            errorFn();
          }
        };

        ifr.addEventListener('load', listener);
        tout = setTimeout(listener, this.iframesTimeout);
      }
    }, {
      key: "onIframeReady",
      value: function onIframeReady(ifr, successFn, errorFn) {
        try {
          if (ifr.contentWindow.document.readyState === 'complete') {
            if (this.isIframeBlank(ifr)) {
              this.observeIframeLoad(ifr, successFn, errorFn);
            } else {
              this.getIframeContents(ifr, successFn, errorFn);
            }
          } else {
            this.observeIframeLoad(ifr, successFn, errorFn);
          }
        } catch (e) {
          errorFn();
        }
      }
    }, {
      key: "waitForIframes",
      value: function waitForIframes(ctx, done) {
        var _this2 = this;

        var eachCalled = 0;
        this.forEachIframe(ctx, function () {
          return true;
        }, function (ifr) {
          eachCalled++;

          _this2.waitForIframes(ifr.querySelector('html'), function () {
            if (! --eachCalled) {
              done();
            }
          });
        }, function (handled) {
          if (!handled) {
            done();
          }
        });
      }
    }, {
      key: "forEachIframe",
      value: function forEachIframe(ctx, filter, each) {
        var _this3 = this;

        var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};
        var ifr = ctx.querySelectorAll('iframe'),
            open = ifr.length,
            handled = 0;
        ifr = Array.prototype.slice.call(ifr);

        var checkEnd = function checkEnd() {
          if (--open <= 0) {
            end(handled);
          }
        };

        if (!open) {
          checkEnd();
        }

        ifr.forEach(function (ifr) {
          if (DOMIterator.matches(ifr, _this3.exclude)) {
            checkEnd();
          } else {
            _this3.onIframeReady(ifr, function (con) {
              if (filter(ifr)) {
                handled++;
                each(con);
              }

              checkEnd();
            }, checkEnd);
          }
        });
      }
    }, {
      key: "createIterator",
      value: function createIterator(ctx, whatToShow, filter) {
        return document.createNodeIterator(ctx, whatToShow, filter, false);
      }
    }, {
      key: "createInstanceOnIframe",
      value: function createInstanceOnIframe(contents) {
        return new DOMIterator(contents.querySelector('html'), this.iframes);
      }
    }, {
      key: "compareNodeIframe",
      value: function compareNodeIframe(node, prevNode, ifr) {
        var compCurr = node.compareDocumentPosition(ifr),
            prev = Node.DOCUMENT_POSITION_PRECEDING;

        if (compCurr & prev) {
          if (prevNode !== null) {
            var compPrev = prevNode.compareDocumentPosition(ifr),
                after = Node.DOCUMENT_POSITION_FOLLOWING;

            if (compPrev & after) {
              return true;
            }
          } else {
            return true;
          }
        }

        return false;
      }
    }, {
      key: "getIteratorNode",
      value: function getIteratorNode(itr) {
        var prevNode = itr.previousNode();
        var node;

        if (prevNode === null) {
          node = itr.nextNode();
        } else {
          node = itr.nextNode() && itr.nextNode();
        }

        return {
          prevNode: prevNode,
          node: node
        };
      }
    }, {
      key: "checkIframeFilter",
      value: function checkIframeFilter(node, prevNode, currIfr, ifr) {
        var key = false,
            handled = false;
        ifr.forEach(function (ifrDict, i) {
          if (ifrDict.val === currIfr) {
            key = i;
            handled = ifrDict.handled;
          }
        });

        if (this.compareNodeIframe(node, prevNode, currIfr)) {
          if (key === false && !handled) {
            ifr.push({
              val: currIfr,
              handled: true
            });
          } else if (key !== false && !handled) {
            ifr[key].handled = true;
          }

          return true;
        }

        if (key === false) {
          ifr.push({
            val: currIfr,
            handled: false
          });
        }

        return false;
      }
    }, {
      key: "handleOpenIframes",
      value: function handleOpenIframes(ifr, whatToShow, eCb, fCb) {
        var _this4 = this;

        ifr.forEach(function (ifrDict) {
          if (!ifrDict.handled) {
            _this4.getIframeContents(ifrDict.val, function (con) {
              _this4.createInstanceOnIframe(con).forEachNode(whatToShow, eCb, fCb);
            });
          }
        });
      }
    }, {
      key: "iterateThroughNodes",
      value: function iterateThroughNodes(whatToShow, ctx, eachCb, filterCb, doneCb) {
        var _this5 = this;

        var itr = this.createIterator(ctx, whatToShow, filterCb);

        var ifr = [],
            elements = [],
            node,
            prevNode,
            retrieveNodes = function retrieveNodes() {
          var _this5$getIteratorNod = _this5.getIteratorNode(itr);

          prevNode = _this5$getIteratorNod.prevNode;
          node = _this5$getIteratorNod.node;
          return node;
        };

        if (this.iframes) {
          while (retrieveNodes()) {
            this.forEachIframe(ctx, function (currIfr) {
              return _this5.checkIframeFilter(node, prevNode, currIfr, ifr);
            }, function (con) {
              _this5.createInstanceOnIframe(con).forEachNode(whatToShow, function (ifrNode) {
                return elements.push(ifrNode);
              }, filterCb);
            });
            elements.push(node);
          }
        } else {
          while (node = itr.nextNode()) {
            elements.push(node);
          }
        }

        elements.forEach(function (node) {
          eachCb(node);
        });

        if (this.iframes) {
          this.handleOpenIframes(ifr, whatToShow, eachCb, filterCb);
        }

        doneCb();
      }
    }, {
      key: "forEachNode",
      value: function forEachNode(whatToShow, each, filter) {
        var _this6 = this;

        var done = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};
        var contexts = this.getContexts();
        var open = contexts.length;

        if (!open) {
          done();
        }

        contexts.forEach(function (ctx) {
          var ready = function ready() {
            _this6.iterateThroughNodes(whatToShow, ctx, each, filter, function () {
              if (--open <= 0) {
                done();
              }
            });
          };

          if (_this6.iframes) {
            _this6.waitForIframes(ctx, ready);
          } else {
            ready();
          }
        });
      }
    }], [{
      key: "matches",
      value: function matches(element, selector) {
        var selectors = typeof selector === 'string' ? [selector] : selector,
            fn = element.matches || element.matchesSelector || element.msMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector;

        if (fn) {
          var match = false;
          selectors.every(function (sel) {
            if (fn.call(element, sel)) {
              match = true;
              return false;
            }

            return true;
          });
          return match;
        } else {
          return false;
        }
      }
    }]);

    return DOMIterator;
  }();

  var RegExpCreator = /*#__PURE__*/function () {
    function RegExpCreator(options) {
      _classCallCheck(this, RegExpCreator);

      this.opt = _extends({}, {
        'diacritics': true,
        'synonyms': {},
        'accuracy': 'partially',
        'caseSensitive': false,
        'ignoreJoiners': false,
        'ignorePunctuation': [],
        'wildcards': 'disabled'
      }, options);
    }

    _createClass(RegExpCreator, [{
      key: "create",
      value: function create(str, patterns) {
        if (this.opt.wildcards !== 'disabled') {
          str = this.setupWildcardsRegExp(str);
        }

        str = this.escapeStr(str);

        if (Object.keys(this.opt.synonyms).length) {
          str = this.createSynonymsRegExp(str);
        }

        if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
          str = this.setupIgnoreJoinersRegExp(str);
        }

        if (this.opt.diacritics) {
          str = this.createDiacriticsRegExp(str);
        }

        str = this.createMergedBlanksRegExp(str);

        if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
          str = this.createJoinersRegExp(str);
        }

        if (this.opt.wildcards !== 'disabled') {
          str = this.createWildcardsRegExp(str);
        }

        if (patterns) {
          return this.createAccuracyRegExp(str, true);
        } else {
          str = this.createAccuracyRegExp(str, false);
          return new RegExp(str, "gm".concat(this.opt.caseSensitive ? '' : 'i'));
        }
      }
    }, {
      key: "sortByLength",
      value: function sortByLength(arry) {
        return arry.sort(function (a, b) {
          return a.length === b.length ? a > b ? 1 : -1 : b.length - a.length;
        });
      }
    }, {
      key: "escapeStr",
      value: function escapeStr(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      }
    }, {
      key: "createSynonymsRegExp",
      value: function createSynonymsRegExp(str) {
        var _this = this;

        var syn = this.opt.synonyms,
            sens = this.opt.caseSensitive ? '' : 'i',
            joinerPlaceholder = this.opt.ignoreJoiners || this.opt.ignorePunctuation.length ? "\0" : '';

        for (var index in syn) {
          if (syn.hasOwnProperty(index)) {
            var keys = Array.isArray(syn[index]) ? syn[index] : [syn[index]];
            keys.unshift(index);
            keys = this.sortByLength(keys).map(function (key) {
              if (_this.opt.wildcards !== 'disabled') {
                key = _this.setupWildcardsRegExp(key);
              }

              key = _this.escapeStr(key);
              return key;
            }).filter(function (k) {
              return k !== '';
            });

            if (keys.length > 1) {
              str = str.replace(new RegExp("(".concat(keys.map(function (k) {
                return _this.escapeStr(k);
              }).join('|'), ")"), "gm".concat(sens)), joinerPlaceholder + "(".concat(keys.map(function (k) {
                return _this.processSynonyms(k);
              }).join('|'), ")") + joinerPlaceholder);
            }
          }
        }

        return str;
      }
    }, {
      key: "processSynonyms",
      value: function processSynonyms(str) {
        if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
          str = this.setupIgnoreJoinersRegExp(str);
        }

        return str;
      }
    }, {
      key: "setupWildcardsRegExp",
      value: function setupWildcardsRegExp(str) {
        str = str.replace(/(?:\\)*\?/g, function (val) {
          return val.charAt(0) === '\\' ? '?' : "\x01";
        });
        return str.replace(/(?:\\)*\*/g, function (val) {
          return val.charAt(0) === '\\' ? '*' : "\x02";
        });
      }
    }, {
      key: "createWildcardsRegExp",
      value: function createWildcardsRegExp(str) {
        var spaces = this.opt.wildcards === 'withSpaces';
        return str.replace(/\u0001/g, spaces ? '[\\S\\s]?' : '\\S?').replace(/\u0002/g, spaces ? '[\\S\\s]*?' : '\\S*');
      }
    }, {
      key: "setupIgnoreJoinersRegExp",
      value: function setupIgnoreJoinersRegExp(str) {
        return str.replace(/[^(|)\\]/g, function (val, indx, original) {
          var nextChar = original.charAt(indx + 1);

          if (/[(|)\\]/.test(nextChar) || nextChar === '') {
            return val;
          } else {
            return val + "\0";
          }
        });
      }
    }, {
      key: "createJoinersRegExp",
      value: function createJoinersRegExp(str) {
        var joiner = [];
        var ignorePunctuation = this.opt.ignorePunctuation;

        if (Array.isArray(ignorePunctuation) && ignorePunctuation.length) {
          joiner.push(this.escapeStr(ignorePunctuation.join('')));
        }

        if (this.opt.ignoreJoiners) {
          joiner.push("\\u00ad\\u200b\\u200c\\u200d");
        }

        return joiner.length ? str.split(/\u0000+/).join("[".concat(joiner.join(''), "]*")) : str;
      }
    }, {
      key: "createDiacriticsRegExp",
      value: function createDiacriticsRegExp(str) {
        var sens = this.opt.caseSensitive ? '' : 'i',
            dct = this.opt.caseSensitive ? ['aàáảãạăằắẳẵặâầấẩẫậäåāą', 'AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ', 'cçćč', 'CÇĆČ', 'dđď', 'DĐĎ', 'eèéẻẽẹêềếểễệëěēę', 'EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ', 'iìíỉĩịîïī', 'IÌÍỈĨỊÎÏĪ', 'lł', 'LŁ', 'nñňń', 'NÑŇŃ', 'oòóỏõọôồốổỗộơởỡớờợöøō', 'OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ', 'rř', 'RŘ', 'sšśșş', 'SŠŚȘŞ', 'tťțţ', 'TŤȚŢ', 'uùúủũụưừứửữựûüůū', 'UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ', 'yýỳỷỹỵÿ', 'YÝỲỶỸỴŸ', 'zžżź', 'ZŽŻŹ'] : ['aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ', 'cçćčCÇĆČ', 'dđďDĐĎ', 'eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ', 'iìíỉĩịîïīIÌÍỈĨỊÎÏĪ', 'lłLŁ', 'nñňńNÑŇŃ', 'oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ', 'rřRŘ', 'sšśșşSŠŚȘŞ', 'tťțţTŤȚŢ', 'uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ', 'yýỳỷỹỵÿYÝỲỶỸỴŸ', 'zžżźZŽŻŹ'];
        var handled = [];
        str.split('').forEach(function (ch) {
          dct.every(function (dct) {
            if (dct.indexOf(ch) !== -1) {
              if (handled.indexOf(dct) > -1) {
                return false;
              }

              str = str.replace(new RegExp("[".concat(dct, "]"), "gm".concat(sens)), "[".concat(dct, "]"));
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
        return str.replace(/[\s]+/gmi, '[\\s]+');
      }
    }, {
      key: "createAccuracyRegExp",
      value: function createAccuracyRegExp(str, patterns) {
        var _this2 = this;

        var chars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~¡¿';
        var acc = this.opt.accuracy,
            val = typeof acc === 'string' ? acc : acc.value,
            ls = typeof acc === 'string' ? [] : acc.limiters,
            lsJoin = '';
        ls.forEach(function (limiter) {
          lsJoin += "|".concat(_this2.escapeStr(limiter));
        });

        if (patterns) {
          var lookbehind = '()',
              pattern,
              lookahead = '';

          switch (val) {
            case 'partially':
            default:
              pattern = str;
              break;

            case 'complementary':
              lsJoin = '\\s' + (lsJoin ? lsJoin : this.escapeStr(chars));
              pattern = "[^".concat(lsJoin, "]*").concat(str, "[^").concat(lsJoin, "]*");
              break;

            case 'exactly':
              lookbehind = "(^|\\s".concat(lsJoin, ")");
              pattern = str, lookahead = "(?=$|\\s".concat(lsJoin, ")");
              break;
          }

          return {
            lookbehind: lookbehind,
            pattern: pattern,
            lookahead: lookahead
          };
        } else {
          switch (val) {
            case 'partially':
            default:
              return "()(".concat(str, ")");

            case 'complementary':
              lsJoin = '\\s' + (lsJoin ? lsJoin : this.escapeStr(chars));
              return "()([^".concat(lsJoin, "]*").concat(str, "[^").concat(lsJoin, "]*)");

            case 'exactly':
              return "(^|\\s".concat(lsJoin, ")(").concat(str, ")(?=$|\\s").concat(lsJoin, ")");
          }
        }
      }
    }]);

    return RegExpCreator;
  }();

  var Mark = /*#__PURE__*/function () {
    function Mark(ctx) {
      _classCallCheck(this, Mark);

      this.ctx = ctx;
      this.cacheDict = {};
      this.ie = false;
      var ua = window.navigator.userAgent;

      if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
        this.ie = true;
      }
    }

    _createClass(Mark, [{
      key: "opt",
      get: function get() {
        return this._opt;
      },
      set: function set(val) {
        this._opt = _extends({}, {
          'element': '',
          'className': '',
          'exclude': [],
          'iframes': false,
          'iframesTimeout': 5000,
          'separateWordSearch': true,
          'acrossElements': false,
          'separateGroups': false,
          'wrapAllRanges': false,
          'ignoreGroups': 0,
          'each': function each() {},
          'noMatch': function noMatch() {},
          'filter': function filter() {
            return true;
          },
          'done': function done() {},
          'debug': false,
          'log': window.console
        }, val);
      }
    }, {
      key: "iterator",
      get: function get() {
        return new DOMIterator(this.ctx, this.opt.iframes, this.opt.exclude, this.opt.iframesTimeout);
      }
    }, {
      key: "log",
      value: function log(msg) {
        var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'debug';
        var log = this.opt.log;

        if (!this.opt.debug) {
          return;
        }

        if (_typeof(log) === 'object' && typeof log[level] === 'function') {
          log[level]("mark.js: ".concat(msg));
        }
      }
    }, {
      key: "getSeparatedKeywords",
      value: function getSeparatedKeywords(sv) {
        var _this = this;

        var stack = [];
        sv.forEach(function (kw) {
          if (!_this.opt.separateWordSearch) {
            if (kw.trim() && stack.indexOf(kw) === -1) {
              stack.push(kw);
            }
          } else {
            kw.split(' ').forEach(function (kwSplitted) {
              if (kwSplitted.trim() && stack.indexOf(kwSplitted) === -1) {
                stack.push(kwSplitted);
              }
            });
          }
        });
        return {
          'keywords': stack.sort(function (a, b) {
            return b.length - a.length;
          }),
          'length': stack.length
        };
      }
    }, {
      key: "isNumeric",
      value: function isNumeric(value) {
        return Number(parseFloat(value)) == value;
      }
    }, {
      key: "checkRanges",
      value: function checkRanges(array) {
        var _this2 = this;

        if (!Array.isArray(array) || Object.prototype.toString.call(array[0]) !== '[object Object]') {
          this.log('markRanges() will only accept an array of objects');
          this.opt.noMatch(array);
          return [];
        }

        var stack = [];
        var last = 0;
        array.sort(function (a, b) {
          return a.start - b.start;
        }).forEach(function (item) {
          var _this2$callNoMatchOnI = _this2.callNoMatchOnInvalidRanges(item, last),
              start = _this2$callNoMatchOnI.start,
              end = _this2$callNoMatchOnI.end,
              valid = _this2$callNoMatchOnI.valid;

          if (valid) {
            item.start = start;
            item.length = end - start;
            stack.push(item);

            if (!_this2.opt.wrapAllRanges) {
              last = end;
            }
          }
        });
        return stack;
      }
    }, {
      key: "callNoMatchOnInvalidRanges",
      value: function callNoMatchOnInvalidRanges(range, last) {
        var start,
            end,
            valid = false;

        if (range && typeof range.start !== 'undefined') {
          start = parseInt(range.start, 10);
          end = start + parseInt(range.length, 10);

          if (this.isNumeric(range.start) && this.isNumeric(range.length) && start >= last && end > start) {
            valid = true;
          } else {
            this.log('Ignoring invalid or overlapping range: ' + "".concat(JSON.stringify(range)));
            this.opt.noMatch(range);
          }
        } else {
          this.log("Ignoring invalid range: ".concat(JSON.stringify(range)));
          this.opt.noMatch(range);
        }

        return {
          start: start,
          end: end,
          valid: valid
        };
      }
    }, {
      key: "checkWhitespaceRanges",
      value: function checkWhitespaceRanges(range, originalLength, string) {
        var end,
            valid = true,
            max = string.length,
            offset = originalLength - max,
            start = parseInt(range.start, 10) - offset;
        start = start > max ? max : start;
        end = start + parseInt(range.length, 10);

        if (end > max) {
          end = max;
          this.log("End range automatically set to the max value of ".concat(max));
        }

        if (start < 0 || end - start <= 0) {
          valid = false;
          this.log("Invalid range: ".concat(JSON.stringify(range)));
          this.opt.noMatch(range);
        } else if (!/\S/.test(string.substring(start, end))) {
          valid = false;
          this.log('Skipping whitespace only range: ' + JSON.stringify(range));
          this.opt.noMatch(range);
        }

        return {
          start: start,
          end: end,
          valid: valid
        };
      }
    }, {
      key: "checkParents",
      value: function checkParents(textNode, checkName) {
        if (textNode === textNode.parentNode.lastChild) {
          if (checkName(textNode.parentNode)) {
            return true;
          } else {
            var parent = textNode.parentNode;

            while (parent === parent.parentNode.lastChild) {
              if (checkName(parent.parentNode)) {
                return true;
              }

              parent = parent.parentNode;
            }
          }

          var node = textNode.parentNode.nextSibling;

          if (node) {
            if (node.nodeType === 1) {
              if (checkName(node)) {
                return true;
              }
            } else {
              return true;
            }
          }
        }

        return false;
      }
    }, {
      key: "checkNextSiblings",
      value: function checkNextSiblings(node, checkName) {
        if (node && node.nodeType === 1) {
          if (checkName(node)) {
            return;
          } else if (node.firstChild) {
            var prevFirstChild,
                child = node.firstChild;

            while (child) {
              if (child.nodeType === 1) {
                if (checkName(child)) {
                  return;
                }

                prevFirstChild = child;
                child = child.firstChild;
                continue;
              }

              return;
            }

            this.checkNextSiblings(prevFirstChild.nextSibling, checkName);
          }

          if (node !== node.parentNode.lastChild) {
            this.checkNextSiblings(node.nextSibling, checkName);
          } else {
            checkName(node.parentNode);
          }
        }
      }
    }, {
      key: "prepare",
      value: function prepare(tags) {
        var str = "\x01 ",
            boundary = this.opt.blockElementsBoundary;

        if (boundary.tagNames && boundary.tagNames.length) {
          var elements = {};

          for (var key in boundary.tagNames) {
            elements[boundary.tagNames[key].toLowerCase()] = 1;
          }

          for (var _key in elements) {
            tags[_key] = 2;
          }
        } else {
          for (var _key2 in tags) {
            tags[_key2] = 2;
          }

          tags['br'] = 1;
        }

        if (boundary["char"]) {
          str = boundary["char"].charAt(0) + ' ';
        }

        return str;
      }
    }, {
      key: "getTextNodesAcrossElements",
      value: function getTextNodesAcrossElements(cb) {
        var _this3 = this;

        if (this.opt.cacheTextNodes && this.cacheDict.nodes) {
          this.cacheDict.lastIndex = 0;
          this.cacheDict.lastTextIndex = 0;
          cb(this.cacheDict);
          return;
        }

        var val = '',
            start,
            text,
            endBySpace,
            type,
            offset,
            startOffset = 0,
            nodes = [],
            boundary = this.opt.blockElementsBoundary,
            str,
            str2;
        var tags = {
          div: 1,
          p: 1,
          li: 1,
          td: 1,
          tr: 1,
          th: 1,
          ul: 1,
          ol: 1,
          br: 1,
          dd: 1,
          dl: 1,
          dt: 1,
          h1: 1,
          h2: 1,
          h3: 1,
          h4: 1,
          h5: 1,
          h6: 1,
          hr: 1,
          blockquote: 1,
          figcaption: 1,
          figure: 1,
          pre: 1,
          table: 1,
          thead: 1,
          tbody: 1,
          tfoot: 1,
          input: 1,
          img: 1,
          nav: 1,
          details: 1,
          label: 1,
          form: 1,
          select: 1,
          menu: 1,
          menuitem: 1,
          main: 1,
          section: 1,
          article: 1,
          aside: 1,
          picture: 1,
          output: 1,
          button: 1,
          header: 1,
          footer: 1,
          address: 1,
          area: 1,
          canvas: 1,
          map: 1,
          fieldset: 1,
          textarea: 1,
          track: 1,
          video: 1,
          audio: 1,
          body: 1,
          iframe: 1,
          meter: 1,
          object: 1,
          svg: 1
        };

        if (boundary) {
          str = this.prepare(tags);
          str2 = ' ' + str;
        }

        this.iterator.forEachNode(NodeFilter.SHOW_TEXT, function (node) {
          offset = 0;
          start = val.length;
          text = node.textContent;
          endBySpace = /\s/.test(text[text.length - 1]);

          if (boundary || !endBySpace) {
            var success = _this3.checkParents(node, function (nd) {
              type = tags[nd.nodeName.toLowerCase()];
              return type;
            });

            if (!success) {
              _this3.checkNextSiblings(node.nextSibling, function (nd) {
                type = tags[nd.nodeName.toLowerCase()];
                return type;
              });
            }

            if (type) {
              if (!endBySpace) {
                if (type === 1) {
                  val += text + ' ';
                  offset = 1;
                } else if (type === 2) {
                  val += text + str2;
                  offset = 3;
                }
              } else if (type === 2) {
                val += text + str;
                offset = 2;
              }
            }
          }

          if (offset === 0) {
            val += text;
          }

          nodes.push({
            start: start,
            end: val.length - offset,
            offset: offset,
            startOffset: startOffset,
            node: node
          });
          startOffset -= offset;
        }, function (node) {
          if (_this3.matchesExclude(node.parentNode)) {
            return NodeFilter.FILTER_REJECT;
          } else {
            return NodeFilter.FILTER_ACCEPT;
          }
        }, function () {
          var dict = {
            value: val,
            nodes: nodes,
            lastIndex: 0,
            lastTextIndex: 0
          };

          if (_this3.opt.cacheTextNodes) {
            _this3.cacheDict = dict;
          }

          cb(dict);
        });
      }
    }, {
      key: "getTextNodes",
      value: function getTextNodes(cb) {
        var _this4 = this;

        if (this.opt.cacheTextNodes && this.cacheDict.nodes) {
          cb(this.cacheDict);
          return;
        }

        var val = '',
            nodes = [];
        this.iterator.forEachNode(NodeFilter.SHOW_TEXT, function (node) {
          nodes.push({
            start: val.length,
            end: (val += node.textContent).length,
            offset: 0,
            node: node
          });
        }, function (node) {
          if (_this4.matchesExclude(node.parentNode)) {
            return NodeFilter.FILTER_REJECT;
          } else {
            return NodeFilter.FILTER_ACCEPT;
          }
        }, function () {
          var dict = {
            value: val,
            nodes: nodes,
            lastIndex: 0,
            lastTextIndex: 0
          };

          if (_this4.opt.cacheTextNodes) {
            _this4.cacheDict = dict;
          }

          cb(dict);
        });
      }
    }, {
      key: "matchesExclude",
      value: function matchesExclude(el) {
        return DOMIterator.matches(el, this.opt.exclude.concat(['script', 'style', 'title', 'head', 'html']));
      }
    }, {
      key: "wrapRangeInTextNode",
      value: function wrapRangeInTextNode(node, start, end) {
        var startNode = node.splitText(start),
            retNode = startNode.splitText(end - start);
        this.createMarkElement(startNode);
        return retNode;
      }
    }, {
      key: "createMarkElement",
      value: function createMarkElement(node) {
        var name = !this.opt.element ? 'mark' : this.opt.element;
        var markNode = document.createElement(name);
        markNode.setAttribute('data-markjs', 'true');

        if (this.opt.className) {
          markNode.setAttribute('class', this.opt.className);
        }

        markNode.textContent = node.textContent;
        node.parentNode.replaceChild(markNode, node);
        return markNode;
      }
    }, {
      key: "wrapRangeInTextNodeInsert",
      value: function wrapRangeInTextNodeInsert(dict, n, s, e, start, index) {
        var ended = e === n.node.textContent.length;

        if (s === 0 && ended) {
          var _markNode = this.createMarkElement(n.node);

          n.node = _markNode.childNodes[0];
          return {
            retNode: n,
            markNode: _markNode,
            increment: 0
          };
        }

        var node = n.node.splitText(s),
            restNode = node.splitText(e - s),
            markNode = this.createMarkElement(node),
            increment = 1;
        var mNode = {
          start: start,
          end: n.start + e,
          offset: 0,
          node: markNode.childNodes[0]
        },
            retNode = {
          start: n.start + e,
          end: n.end,
          offset: n.offset,
          node: restNode
        };

        if (s === 0) {
          dict.nodes.splice(index, 1, mNode, retNode);
        } else {
          if (ended) {
            dict.nodes.splice(index + 1, 0, mNode);
          } else {
            dict.nodes.splice(index + 1, 0, mNode, retNode);
            increment = 2;
          }

          n.end = start;
          n.offset = 0;
        }

        return {
          retNode: retNode,
          markNode: markNode,
          increment: increment
        };
      }
    }, {
      key: "wrapRangeInMappedTextNode",
      value: function wrapRangeInMappedTextNode(dict, start, end, filterCb, eachCb) {
        var i = dict.lastIndex,
            rangeStart = true;

        if (this.opt.wrapAllRanges) {
          while (i >= 0 && dict.nodes[i].start > start) {
            i--;
          }
        } else if (start < dict.lastTextIndex) {
          this.log('The attempt to wrap overlapping range.');
          return;
        }

        for (i; i < dict.nodes.length; i++) {
          if (i + 1 === dict.nodes.length || dict.nodes[i + 1].start > start) {
            var n = dict.nodes[i];

            if (!filterCb(n)) {
              if (i > dict.lastIndex) {
                dict.lastIndex = i;
              }

              break;
            }

            var s = start - n.start,
                e = (end > n.end ? n.end : end) - n.start;

            if (s >= 0 && e > s) {
              if (this.opt.wrapAllRanges) {
                var ret = this.wrapRangeInTextNodeInsert(dict, n, s, e, start, i);
                n = ret.retNode;
                eachCb(ret.markNode, rangeStart);
              } else {
                n.node = this.wrapRangeInTextNode(n.node, s, e);
                n.start += e;
                dict.lastTextIndex = n.start;
                eachCb(n.node.previousSibling, rangeStart);
              }

              rangeStart = false;
            }

            if (end > n.end) {
              start = n.end + n.offset;
            } else {
              dict.lastIndex = i;
              break;
            }
          }
        }
      }
    }, {
      key: "wrapGroups",
      value: function wrapGroups(node, pos, len, eachCb) {
        node = this.wrapRangeInTextNode(node, pos, pos + len);
        eachCb(node.previousSibling);
        return node;
      }
    }, {
      key: "separateGroupsD",
      value: function separateGroupsD(node, match, params, filterCb, eachCb) {
        var lastIndex = 0,
            offset = 0,
            i = 0,
            isWrapped = false,
            group,
            start,
            end = 0;

        while (++i < match.length) {
          group = match[i];

          if (group) {
            start = match.indices[i][0];

            if (start >= lastIndex) {
              end = match.indices[i][1];

              if (filterCb(group, node, i)) {
                node = this.wrapGroups(node, start - offset, end - start, function (node) {
                  eachCb(node, i);
                });

                if (end > lastIndex) {
                  lastIndex = end;
                }

                offset = end;
                isWrapped = true;
              }
            }
          }
        }

        if (isWrapped) {
          params.regex.lastIndex = 0;
        } else if (match[0].length === 0) {
          this.setLastIndex(params.regex, end);
        }

        return node;
      }
    }, {
      key: "separateGroups",
      value: function separateGroups(node, match, params, filterCb, eachCb) {
        var startIndex = match.index,
            i = -1,
            isWrapped = false,
            index,
            group,
            start;

        while (++i < params.groups.length) {
          index = params.groups[i];
          group = match[index];

          if (group) {
            start = node.textContent.indexOf(group, startIndex);

            if (start !== -1) {
              if (filterCb(group, node, index)) {
                node = this.wrapGroups(node, start, group.length, function (node) {
                  eachCb(node, index);
                });
                startIndex = 0;
                isWrapped = true;
              } else {
                startIndex = start + group.length;
              }
            }
          }
        }

        if (isWrapped) {
          params.regex.lastIndex = 0;
        }

        return node;
      }
    }, {
      key: "wrapMatchGroupsD",
      value: function wrapMatchGroupsD(dict, match, params, filterCb, eachCb) {
        var lastIndex = 0,
            i = 0,
            group,
            start,
            end = 0,
            isWrapped;

        while (++i < match.length) {
          group = match[i];

          if (group) {
            start = match.indices[i][0];

            if (this.opt.wrapAllRanges || start >= lastIndex) {
              end = match.indices[i][1];
              isWrapped = false;
              this.wrapRangeInMappedTextNode(dict, start, end, function (obj) {
                return filterCb(group, obj.node, i);
              }, function (node, groupStart) {
                isWrapped = true;
                eachCb(node, groupStart, i);
              });

              if (isWrapped && end > lastIndex) {
                lastIndex = end;
              }
            }
          }
        }

        if (match[0].length === 0) {
          this.setLastIndex(params.regex, end);
        }
      }
    }, {
      key: "setLastIndex",
      value: function setLastIndex(regex, end) {
        if (end > regex.lastIndex) {
          regex.lastIndex = end;
        } else if (end > 0) {
          regex.lastIndex++;
        } else {
          regex.lastIndex = Infinity;
        }
      }
    }, {
      key: "wrapMatchGroups",
      value: function wrapMatchGroups(dict, match, params, filterCb, eachCb) {
        var startIndex = 0,
            index = 0,
            group,
            start,
            end;
        var s = match.index,
            text = match[0];

        if (this.opt.wrapAllRanges) {
          this.wrapRangeInMappedTextNode(dict, s, s + text.length, function (obj) {
            return filterCb(text, obj.node, index);
          }, function (node, groupStart) {
            eachCb(node, groupStart, index);
          });
        }

        for (var i = 0; i < params.groups.length; i++) {
          index = params.groups[i];
          group = match[index];

          if (group) {
            start = text.indexOf(group, startIndex);
            end = start + group.length;

            if (start !== -1) {
              this.wrapRangeInMappedTextNode(dict, s + start, s + end, function (obj) {
                return filterCb(group, obj.node, index);
              }, function (node, groupStart) {
                eachCb(node, groupStart, index);
              });
              startIndex = end;
            }
          }
        }
      }
    }, {
      key: "collectRegexGroupIndexes",
      value: function collectRegexGroupIndexes(regex) {
        var groups = [],
            stack = [],
            i = -1,
            index = 1,
            brackets = 0,
            charsRange = false,
            str = regex.source,
            reg = /^\(\?<(?![=!])|^\((?!\?)/;

        while (++i < str.length) {
          switch (str[i]) {
            case '(':
              if (!charsRange) {
                if (reg.test(str.substring(i))) {
                  stack.push(1);

                  if (brackets === 0) {
                    groups.push(index);
                  }

                  brackets++;
                  index++;
                } else {
                  stack.push(0);
                }
              }

              break;

            case ')':
              if (!charsRange && stack.pop() === 1) {
                brackets--;
              }

              break;

            case '\\':
              i++;
              break;

            case '[':
              charsRange = true;
              break;

            case ']':
              charsRange = false;
              break;

            default:
              break;
          }
        }

        return groups;
      }
    }, {
      key: "wrapSeparateGroups",
      value: function wrapSeparateGroups(regex, unused, filterCb, eachCb, endCb) {
        var _this5 = this;

        var fn = regex.hasIndices ? 'separateGroupsD' : 'separateGroups',
            params = {
          regex: regex,
          groups: regex.hasIndices ? {} : this.collectRegexGroupIndexes(regex)
        },
            execution = {
          abort: false
        },
            filterInfo = {
          execution: execution
        };
        var node,
            match,
            matchStart,
            eMatchStart,
            count = 0;
        this.getTextNodes(function (dict) {
          dict.nodes.every(function (nd) {
            node = nd.node;
            filterInfo.offset = nd.start;

            while ((match = regex.exec(node.textContent)) !== null && (regex.hasIndices || match[0] !== '')) {
              filterInfo.match = match;
              matchStart = eMatchStart = true;
              node = _this5[fn](node, match, params, function (group, node, groupIndex) {
                filterInfo.matchStart = matchStart;
                filterInfo.groupIndex = groupIndex;
                matchStart = false;
                return filterCb(group, node, filterInfo);
              }, function (node, groupIndex) {
                if (eMatchStart) {
                  count++;
                }

                eachCb(node, {
                  match: match,
                  matchStart: eMatchStart,
                  count: count,
                  groupIndex: groupIndex
                });
                eMatchStart = false;
              });

              if (execution.abort) {
                break;
              }
            }

            return !execution.abort;
          });
          endCb(count);
        });
      }
    }, {
      key: "wrapMatches",
      value: function wrapMatches(regex, ignoreGroups, filterCb, eachCb, endCb) {
        var _this6 = this;

        var index = ignoreGroups === 0 ? 0 : ignoreGroups + 1,
            execution = {
          abort: false
        },
            filterInfo = {
          execution: execution
        };
        var info,
            node,
            match,
            count = 0;
        this.getTextNodes(function (dict) {
          for (var k = 0; k < dict.nodes.length; k++) {
            info = dict.nodes[k];
            node = info.node;

            while ((match = regex.exec(node.textContent)) !== null && match[index] !== '') {
              filterInfo.match = match;
              filterInfo.offset = info.start;

              if (!filterCb(match[index], node, filterInfo)) {
                continue;
              }

              var len = match[index].length,
                  start = match.index;

              if (index !== 0) {
                for (var i = 1; i < index; i++) {
                  start += match[i].length;
                }
              }

              if (_this6.opt.cacheTextNodes) {
                var ret = _this6.wrapRangeInTextNodeInsert(dict, info, start, start + len, info.start + start, k);

                count++;
                eachCb(ret.markNode, {
                  match: match,
                  count: count
                });

                if (ret.increment === 0) {
                  regex.lastIndex = 0;
                  break;
                }

                k += ret.increment;
                info = ret.retNode;
                node = info.node;
              } else {
                node = _this6.wrapGroups(node, start, len, function (node) {
                  count++;
                  eachCb(node, {
                    match: match,
                    count: count
                  });
                });
              }

              regex.lastIndex = 0;

              if (execution.abort) {
                break;
              }
            }

            if (execution.abort) {
              break;
            }
          }

          endCb(count, dict);
        });
      }
    }, {
      key: "wrapGroupsAcrossElements",
      value: function wrapGroupsAcrossElements(regex, unused, filterCb, eachCb, endCb) {
        var _this7 = this;

        var fn = regex.hasIndices ? 'wrapMatchGroupsD' : 'wrapMatchGroups',
            params = {
          regex: regex,
          groups: regex.hasIndices ? {} : this.collectRegexGroupIndexes(regex)
        },
            execution = {
          abort: false
        },
            filterInfo = {
          execution: execution
        };
        var match,
            matchStart,
            eMatchStart,
            count = 0;
        this.getTextNodesAcrossElements(function (dict) {
          while ((match = regex.exec(dict.value)) !== null && (regex.hasIndices || match[0] !== '')) {
            filterInfo.match = match;
            matchStart = eMatchStart = true;

            _this7[fn](dict, match, params, function (group, node, groupIndex) {
              filterInfo.matchStart = matchStart;
              filterInfo.groupIndex = groupIndex;
              matchStart = false;
              return filterCb(group, node, filterInfo);
            }, function (node, groupStart, groupIndex) {
              if (eMatchStart) {
                count++;
              }

              eachCb(node, {
                match: match,
                matchStart: eMatchStart,
                count: count,
                groupIndex: groupIndex,
                groupStart: groupStart
              });
              eMatchStart = false;
            });

            if (execution.abort) {
              break;
            }
          }

          endCb(count);
        });
      }
    }, {
      key: "wrapMatchesAcrossElements",
      value: function wrapMatchesAcrossElements(regex, ignoreGroups, filterCb, eachCb, endCb) {
        var _this8 = this;

        var index = ignoreGroups === 0 ? 0 : ignoreGroups + 1,
            execution = {
          abort: false
        },
            filterInfo = {
          execution: execution
        };
        var match,
            matchStart,
            count = 0;
        this.getTextNodesAcrossElements(function (dict) {
          while ((match = regex.exec(dict.value)) !== null && match[index] !== '') {
            filterInfo.match = match;
            matchStart = true;
            var start = match.index;

            if (index !== 0) {
              for (var i = 1; i < index; i++) {
                start += match[i].length;
              }
            }

            var end = start + match[index].length;

            _this8.wrapRangeInMappedTextNode(dict, start, end, function (obj) {
              filterInfo.matchStart = matchStart;
              filterInfo.offset = obj.startOffset;
              matchStart = false;
              return filterCb(match[index], obj.node, filterInfo);
            }, function (node, matchStart) {
              if (matchStart) {
                count++;
              }

              eachCb(node, {
                match: match,
                matchStart: matchStart,
                count: count
              });
            });

            if (execution.abort) {
              break;
            }
          }

          endCb(count, dict);
        });
      }
    }, {
      key: "wrapRangeFromIndex",
      value: function wrapRangeFromIndex(ranges, filterCb, eachCb, endCb) {
        var _this9 = this;

        var count = 0;
        this.getTextNodes(function (dict) {
          var originalLength = dict.value.length;
          ranges.forEach(function (range, counter) {
            var _this9$checkWhitespac = _this9.checkWhitespaceRanges(range, originalLength, dict.value),
                start = _this9$checkWhitespac.start,
                end = _this9$checkWhitespac.end,
                valid = _this9$checkWhitespac.valid;

            if (valid) {
              _this9.wrapRangeInMappedTextNode(dict, start, end, function (obj) {
                return filterCb(obj.node, range, dict.value.substring(start, end), counter);
              }, function (node, rangeStart) {
                if (rangeStart) {
                  count++;
                }

                eachCb(node, range);
              });
            }
          });
          endCb(count);
        });
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

        if (!this.ie) {
          parent.normalize();
        } else {
          this.normalizeTextNode(parent);
        }
      }
    }, {
      key: "normalizeTextNode",
      value: function normalizeTextNode(node) {
        if (!node) {
          return;
        }

        if (node.nodeType === 3) {
          while (node.nextSibling && node.nextSibling.nodeType === 3) {
            node.nodeValue += node.nextSibling.nodeValue;
            node.parentNode.removeChild(node.nextSibling);
          }
        } else {
          this.normalizeTextNode(node.firstChild);
        }

        this.normalizeTextNode(node.nextSibling);
      }
    }, {
      key: "markRegExp",
      value: function markRegExp(regexp, opt) {
        var _this10 = this;

        this.opt = opt;
        var totalMarks = 0,
            fn = this.getMethodName(opt);

        if (this.opt.acrossElements) {
          if (!regexp.global && !regexp.sticky) {
            var splits = regexp.toString().split('/');
            regexp = new RegExp(regexp.source, 'g' + splits[splits.length - 1]);
            this.log('RegExp is recompiled with g flag because it must have g flag');
          }
        }

        this.log("Searching with expression \"".concat(regexp, "\""));
        this[fn](regexp, this.opt.ignoreGroups, function (match, node, filterInfo) {
          return _this10.opt.filter(node, match, totalMarks, filterInfo);
        }, function (element, matchInfo) {
          totalMarks++;

          _this10.opt.each(element, matchInfo);
        }, function (totalMatches) {
          if (totalMatches === 0) {
            _this10.opt.noMatch(regexp);
          }

          _this10.opt.done(totalMarks, totalMatches);
        });
      }
    }, {
      key: "mark",
      value: function mark(sv, opt) {
        var _this11 = this;

        this.opt = opt;

        if (this.opt.combinePatterns) {
          this.markCombinePatterns(sv, opt);
          return;
        }

        var index = 0,
            totalMarks = 0,
            totalMatches = 0;
        var fn = this.opt.acrossElements ? 'wrapMatchesAcrossElements' : 'wrapMatches',
            termStats = {};

        var _this$getSeparatedKey = this.getSeparatedKeywords(typeof sv === 'string' ? [sv] : sv),
            keywords = _this$getSeparatedKey.keywords,
            length = _this$getSeparatedKey.length,
            handler = function handler(kw) {
          var regex = new RegExpCreator(_this11.opt).create(kw);
          var matches = 0;

          _this11.log("Searching with expression \"".concat(regex, "\""));

          _this11[fn](regex, 1, function (term, node, filterInfo) {
            return _this11.opt.filter(node, kw, totalMarks, matches, filterInfo);
          }, function (element, matchInfo) {
            matches++;
            totalMarks++;

            _this11.opt.each(element, matchInfo);
          }, function (count) {
            totalMatches += count;

            if (count === 0) {
              _this11.opt.noMatch(kw);
            }

            termStats[kw] = count;

            if (++index < length) {
              handler(keywords[index]);
            } else {
              _this11.opt.done(totalMarks, totalMatches, termStats);
            }
          });
        };

        if (length === 0) {
          this.opt.done(0, 0, termStats);
        } else {
          handler(keywords[index]);
        }
      }
    }, {
      key: "markCombinePatterns",
      value: function markCombinePatterns(sv, opt) {
        var _this12 = this;

        this.opt = opt;
        var index = 0,
            totalMarks = 0,
            totalMatches = 0,
            patterns = [];
        var fn = this.opt.acrossElements ? 'wrapMatchesAcrossElements' : 'wrapMatches',
            flags = "gm".concat(this.opt.caseSensitive ? '' : 'i'),
            termStats = {},
            obj = this.getSeparatedKeywords(typeof sv === 'string' ? [sv] : sv);

        var handler = function handler(pattern) {
          var regex = new RegExp(pattern, flags);
          var matches = 0;

          _this12.log("Searching with expression \"".concat(regex, "\""));

          _this12[fn](regex, 1, function (term, node, filterInfo) {
            return _this12.opt.filter(node, term, totalMarks, matches, filterInfo);
          }, function (element, matchInfo) {
            matches++;
            totalMarks++;

            if (_this12.opt.acrossElements) {
              if (matchInfo.matchStart) {
                termStats[_this12.normalizeTerm(matchInfo.match[2])] += 1;
              }
            } else {
              termStats[_this12.normalizeTerm(matchInfo.match[2])] += 1;
            }

            _this12.opt.each(element, matchInfo);
          }, function (count) {
            totalMatches += count;

            if (count === 0) {
              _this12.opt.noMatch(termStats);
            }

            if (++index < patterns.length) {
              handler(patterns[index]);
            } else {
              _this12.opt.done(totalMarks, totalMatches, termStats);
            }
          });
        };

        if (obj.length === 0) {
          this.opt.done(0, 0, termStats);
        } else {
          obj.keywords.forEach(function (kw) {
            termStats[_this12.normalizeTerm(kw)] = 0;
          });
          patterns = this.getPatterns(obj.keywords);
          handler(patterns[index]);
        }
      }
    }, {
      key: "normalizeTerm",
      value: function normalizeTerm(term) {
        term = term.trim().replace(/\s{2,}/g, ' ');
        return this.opt.caseSensitive ? term : term.toLowerCase();
      }
    }, {
      key: "getPatterns",
      value: function getPatterns(keywords) {
        var regexCreator = new RegExpCreator(this.opt),
            first = regexCreator.create(keywords[0], true),
            patterns = [];
        var num = 10;

        if (typeof this.opt.combinePatterns !== 'boolean') {
          var _int = parseInt(this.opt.combinePatterns, 10);

          if (this.isNumeric(_int)) {
            num = _int;
          }
        }

        var count = Math.ceil(keywords.length / num);

        for (var k = 0; k < count; k++) {
          var pattern = first.lookbehind + '(',
              max = Math.min(k * num + num, keywords.length);

          for (var i = k * num; i < max; i++) {
            var ptn = regexCreator.create(keywords[i], true).pattern;
            pattern += "(?:".concat(ptn, ")").concat(i < max - 1 ? '|' : '');
          }

          patterns.push(pattern + ')' + first.lookahead);
        }

        return patterns;
      }
    }, {
      key: "getMethodName",
      value: function getMethodName(opt) {
        if (opt) {
          if (opt.acrossElements) {
            if (opt.separateGroups) {
              return 'wrapGroupsAcrossElements';
            }

            return 'wrapMatchesAcrossElements';
          }

          if (opt.separateGroups) {
            return 'wrapSeparateGroups';
          }
        }

        return 'wrapMatches';
      }
    }, {
      key: "markRanges",
      value: function markRanges(rawRanges, opt) {
        var _this13 = this;

        this.opt = opt;
        var totalMarks = 0,
            ranges = this.checkRanges(rawRanges);

        if (ranges && ranges.length) {
          this.log('Starting to mark with the following ranges: ' + JSON.stringify(ranges));
          this.wrapRangeFromIndex(ranges, function (node, range, match, counter) {
            return _this13.opt.filter(node, range, match, counter);
          }, function (element, range) {
            totalMarks++;

            _this13.opt.each(element, range);
          }, function (totalMatches) {
            _this13.opt.done(totalMarks, totalMatches);
          });
        } else {
          this.opt.done(0, 0);
        }
      }
    }, {
      key: "unmark",
      value: function unmark(opt) {
        var _this14 = this;

        this.opt = opt;
        var sel = this.opt.element ? this.opt.element : '*';
        sel += '[data-markjs]';

        if (this.opt.className) {
          sel += ".".concat(this.opt.className);
        }

        this.log("Removal selector \"".concat(sel, "\""));
        this.iterator.forEachNode(NodeFilter.SHOW_ELEMENT, function (node) {
          _this14.unwrapMatches(node);
        }, function (node) {
          var matchesSel = DOMIterator.matches(node, sel),
              matchesExclude = _this14.matchesExclude(node);

          if (!matchesSel || matchesExclude) {
            return NodeFilter.FILTER_REJECT;
          } else {
            return NodeFilter.FILTER_ACCEPT;
          }
        }, this.opt.done);
      }
    }]);

    return Mark;
  }();

  $.fn.mark = function (sv, opt) {
    new Mark(this.get()).mark(sv, opt);
    return this;
  };

  $.fn.markRegExp = function (regexp, opt) {
    new Mark(this.get()).markRegExp(regexp, opt);
    return this;
  };

  $.fn.markRanges = function (ranges, opt) {
    new Mark(this.get()).markRanges(ranges, opt);
    return this;
  };

  $.fn.unmark = function (opt) {
    new Mark(this.get()).unmark(opt);
    return this;
  };

  return $;

})));
