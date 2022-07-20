/*!***************************************************
* mark.js v9.0.0
* https://markjs.io/
* Copyright (c) 2014–2022, Julian Kühnel
* Released under the MIT license https://git.io/vwTVl
*****************************************************/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Mark = factory());
}(this, (function () { 'use strict';

  class DOMIterator {
    constructor(ctx, iframes = true, exclude = [], iframesTimeout = 5000) {
      this.ctx = ctx;
      this.iframes = iframes;
      this.exclude = exclude;
      this.iframesTimeout = iframesTimeout;
    }
    static matches(element, selector) {
      const selectors = typeof selector === 'string' ? [selector] : selector,
        fn = (
          element.matches ||
          element.matchesSelector ||
          element.msMatchesSelector ||
          element.mozMatchesSelector ||
          element.oMatchesSelector ||
          element.webkitMatchesSelector
        );
      if (fn) {
        let match = false;
        selectors.every(sel => {
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
    getContexts() {
      let ctx,
        filteredCtx = [];
      if (typeof this.ctx === 'undefined' || !this.ctx) {
        ctx = [];
      } else if (NodeList.prototype.isPrototypeOf(this.ctx)) {
        ctx = Array.prototype.slice.call(this.ctx);
      } else if (Array.isArray(this.ctx)) {
        ctx = this.ctx;
      } else if (typeof this.ctx === 'string') {
        ctx = Array.prototype.slice.call(
          document.querySelectorAll(this.ctx)
        );
      } else {
        ctx = [this.ctx];
      }
      ctx.forEach(ctx => {
        const isDescendant = filteredCtx.filter(contexts => {
          return contexts.contains(ctx);
        }).length > 0;
        if (filteredCtx.indexOf(ctx) === -1 && !isDescendant) {
          filteredCtx.push(ctx);
        }
      });
      return filteredCtx;
    }
    getIframeContents(ifr, successFn, errorFn = () => {}) {
      let doc;
      try {
        const ifrWin = ifr.contentWindow;
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
    isIframeBlank(ifr) {
      const bl = 'about:blank',
        src = ifr.getAttribute('src').trim(),
        href = ifr.contentWindow.location.href;
      return href === bl && src !== bl && src;
    }
    observeIframeLoad(ifr, successFn, errorFn) {
      let called = false,
        tout = null;
      const listener = () => {
        if (called) {
          return;
        }
        called = true;
        clearTimeout(tout);
        try {
          if (!this.isIframeBlank(ifr)) {
            ifr.removeEventListener('load', listener);
            this.getIframeContents(ifr, successFn, errorFn);
          }
        } catch (e) {
          errorFn();
        }
      };
      ifr.addEventListener('load', listener);
      tout = setTimeout(listener, this.iframesTimeout);
    }
    onIframeReady(ifr, successFn, errorFn) {
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
    waitForIframes(ctx, done) {
      let eachCalled = 0;
      this.forEachIframe(ctx, () => true, ifr => {
        eachCalled++;
        this.waitForIframes(ifr.querySelector('html'), () => {
          if (!(--eachCalled)) {
            done();
          }
        });
      }, handled => {
        if (!handled) {
          done();
        }
      });
    }
    forEachIframe(ctx, filter, each, end = () => {}) {
      let ifr = ctx.querySelectorAll('iframe'),
        open = ifr.length,
        handled = 0;
      ifr = Array.prototype.slice.call(ifr);
      const checkEnd = () => {
        if (--open <= 0) {
          end(handled);
        }
      };
      if (!open) {
        checkEnd();
      }
      ifr.forEach(ifr => {
        if (DOMIterator.matches(ifr, this.exclude)) {
          checkEnd();
        } else {
          this.onIframeReady(ifr, con => {
            if (filter(ifr)) {
              handled++;
              each(con);
            }
            checkEnd();
          }, checkEnd);
        }
      });
    }
    createIterator(ctx, whatToShow, filter) {
      return document.createNodeIterator(ctx, whatToShow, filter, false);
    }
    createInstanceOnIframe(contents) {
      return new DOMIterator(contents.querySelector('html'), this.iframes);
    }
    compareNodeIframe(node, prevNode, ifr) {
      const compCurr = node.compareDocumentPosition(ifr),
        prev = Node.DOCUMENT_POSITION_PRECEDING;
      if (compCurr & prev) {
        if (prevNode !== null) {
          const compPrev = prevNode.compareDocumentPosition(ifr),
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
    getIteratorNode(itr) {
      const prevNode = itr.previousNode();
      let node;
      if (prevNode === null) {
        node = itr.nextNode();
      } else {
        node = itr.nextNode() && itr.nextNode();
      }
      return {
        prevNode,
        node
      };
    }
    checkIframeFilter(node, prevNode, currIfr, ifr) {
      let key = false,
        handled = false;
      ifr.forEach((ifrDict, i) => {
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
    handleOpenIframes(ifr, whatToShow, eCb, fCb) {
      ifr.forEach(ifrDict => {
        if (!ifrDict.handled) {
          this.getIframeContents(ifrDict.val, con => {
            this.createInstanceOnIframe(con).forEachNode(
              whatToShow, eCb, fCb
            );
          });
        }
      });
    }
    iterateThroughNodes(whatToShow, ctx, eachCb, filterCb, doneCb) {
      const itr = this.createIterator(ctx, whatToShow, filterCb);
      let ifr = [],
        elements = [],
        node, prevNode, retrieveNodes = () => {
          ({
            prevNode,
            node
          } = this.getIteratorNode(itr));
          return node;
        };
      if (this.iframes) {
        while (retrieveNodes()) {
          this.forEachIframe(ctx, currIfr => {
            return this.checkIframeFilter(node, prevNode, currIfr, ifr);
          }, con => {
            this.createInstanceOnIframe(con).forEachNode(
              whatToShow, ifrNode => elements.push(ifrNode), filterCb
            );
          });
          elements.push(node);
        }
      } else {
        while ((node = itr.nextNode())) {
          elements.push(node);
        }
      }
      elements.forEach(node => {
        eachCb(node);
      });
      if (this.iframes) {
        this.handleOpenIframes(ifr, whatToShow, eachCb, filterCb);
      }
      doneCb();
    }
    forEachNode(whatToShow, each, filter, done = () => {}) {
      const contexts = this.getContexts();
      let open = contexts.length;
      if (!open) {
        done();
      }
      contexts.forEach(ctx => {
        const ready = () => {
          this.iterateThroughNodes(whatToShow, ctx, each, filter, () => {
            if (--open <= 0) {
              done();
            }
          });
        };
        if (this.iframes) {
          this.waitForIframes(ctx, ready);
        } else {
          ready();
        }
      });
    }
  }

  class RegExpCreator {
    constructor(options) {
      this.opt = Object.assign({}, {
        'diacritics': true,
        'synonyms': {},
        'accuracy': 'partially',
        'caseSensitive': false,
        'ignoreJoiners': false,
        'ignorePunctuation': [],
        'wildcards': 'disabled'
      }, options);
    }
    create(str) {
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
      str = this.createAccuracyRegExp(str);
      return new RegExp(str, `gm${this.opt.caseSensitive ? '' : 'i'}`);
    }
    sortByLength(arry) {
      return arry.sort((a, b) => a.length === b.length ?
        (a > b ? 1 : -1) :
        b.length - a.length
      );
    }
    escapeStr(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
    createSynonymsRegExp(str) {
      const syn = this.opt.synonyms,
        sens = this.opt.caseSensitive ? '' : 'i',
        joinerPlaceholder = this.opt.ignoreJoiners ||
        this.opt.ignorePunctuation.length ? '\u0000' : '';
      for (let index in syn) {
        if (syn.hasOwnProperty(index)) {
          let keys = Array.isArray(syn[index]) ? syn[index] : [syn[index]];
          keys.unshift(index);
          keys = this.sortByLength(keys).map(key => {
            if (this.opt.wildcards !== 'disabled') {
              key = this.setupWildcardsRegExp(key);
            }
            key = this.escapeStr(key);
            return key;
          }).filter(k => k !== '');
          if (keys.length > 1) {
            str = str.replace(
              new RegExp(
                `(${keys.map(k => this.escapeStr(k)).join('|')})`,
                `gm${sens}`
              ),
              joinerPlaceholder +
              `(${keys.map(k => this.processSynonyms(k)).join('|')})` +
              joinerPlaceholder
            );
          }
        }
      }
      return str;
    }
    processSynonyms(str) {
      if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
        str = this.setupIgnoreJoinersRegExp(str);
      }
      return str;
    }
    setupWildcardsRegExp(str) {
      str = str.replace(/(?:\\)*\?/g, val => {
        return val.charAt(0) === '\\' ? '?' : '\u0001';
      });
      return str.replace(/(?:\\)*\*/g, val => {
        return val.charAt(0) === '\\' ? '*' : '\u0002';
      });
    }
    createWildcardsRegExp(str) {
      let spaces = this.opt.wildcards === 'withSpaces';
      return str
        .replace(/\u0001/g, spaces ? '[\\S\\s]?' : '\\S?')
        .replace(/\u0002/g, spaces ? '[\\S\\s]*?' : '\\S*');
    }
    setupIgnoreJoinersRegExp(str) {
      return str.replace(/[^(|)\\]/g, (val, indx, original) => {
        let nextChar = original.charAt(indx + 1);
        if (/[(|)\\]/.test(nextChar) || nextChar === '') {
          return val;
        } else {
          return val + '\u0000';
        }
      });
    }
    createJoinersRegExp(str) {
      let joiner = [];
      const ignorePunctuation = this.opt.ignorePunctuation;
      if (Array.isArray(ignorePunctuation) && ignorePunctuation.length) {
        joiner.push(this.escapeStr(ignorePunctuation.join('')));
      }
      if (this.opt.ignoreJoiners) {
        joiner.push('\\u00ad\\u200b\\u200c\\u200d');
      }
      return joiner.length ?
        str.split(/\u0000+/).join(`[${joiner.join('')}]*`) :
        str;
    }
    createDiacriticsRegExp(str) {
      const sens = this.opt.caseSensitive ? '' : 'i',
        dct = this.opt.caseSensitive ? [
          'aàáảãạăằắẳẵặâầấẩẫậäåāą', 'AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ',
          'cçćč', 'CÇĆČ', 'dđď', 'DĐĎ',
          'eèéẻẽẹêềếểễệëěēę', 'EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ',
          'iìíỉĩịîïī', 'IÌÍỈĨỊÎÏĪ', 'lł', 'LŁ', 'nñňń',
          'NÑŇŃ', 'oòóỏõọôồốổỗộơởỡớờợöøō', 'OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ',
          'rř', 'RŘ', 'sšśșş', 'SŠŚȘŞ',
          'tťțţ', 'TŤȚŢ', 'uùúủũụưừứửữựûüůū', 'UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ',
          'yýỳỷỹỵÿ', 'YÝỲỶỸỴŸ', 'zžżź', 'ZŽŻŹ'
        ] : [
          'aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ', 'cçćčCÇĆČ',
          'dđďDĐĎ', 'eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ',
          'iìíỉĩịîïīIÌÍỈĨỊÎÏĪ', 'lłLŁ', 'nñňńNÑŇŃ',
          'oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ', 'rřRŘ',
          'sšśșşSŠŚȘŞ', 'tťțţTŤȚŢ',
          'uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ', 'yýỳỷỹỵÿYÝỲỶỸỴŸ', 'zžżźZŽŻŹ'
        ];
      let handled = [];
      str.split('').forEach(ch => {
        dct.every(dct => {
          if (dct.indexOf(ch) !== -1) {
            if (handled.indexOf(dct) > -1) {
              return false;
            }
            str = str.replace(
              new RegExp(`[${dct}]`, `gm${sens}`), `[${dct}]`
            );
            handled.push(dct);
          }
          return true;
        });
      });
      return str;
    }
    createMergedBlanksRegExp(str) {
      return str.replace(/[\s]+/gmi, '[\\s]+');
    }
    createAccuracyRegExp(str) {
      const chars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~¡¿';
      let acc = this.opt.accuracy,
        val = typeof acc === 'string' ? acc : acc.value,
        ls = typeof acc === 'string' ? [] : acc.limiters,
        lsJoin = '';
      ls.forEach(limiter => {
        lsJoin += `|${this.escapeStr(limiter)}`;
      });
      switch (val) {
        case 'partially':
        default:
          return `()(${str})`;
        case 'complementary':
          lsJoin = '\\s' + (lsJoin ? lsJoin : this.escapeStr(chars));
          return `()([^${lsJoin}]*${str}[^${lsJoin}]*)`;
        case 'exactly':
          return `(^|\\s${lsJoin})(${str})(?=$|\\s${lsJoin})`;
      }
    }
  }

  class Mark {
    constructor(ctx) {
      this.ctx = ctx;
      this.cacheDict = {};
      this.ie = false;
      const ua = window.navigator.userAgent;
      if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
        this.ie = true;
      }
    }
    set opt(val) {
      this._opt = Object.assign({}, {
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
        'each': () => {},
        'noMatch': () => {},
        'filter': () => true,
        'done': () => {},
        'debug': false,
        'log': window.console
      }, val);
    }
    get opt() {
      return this._opt;
    }
    get iterator() {
      return new DOMIterator(
        this.ctx,
        this.opt.iframes,
        this.opt.exclude,
        this.opt.iframesTimeout
      );
    }
    log(msg, level = 'debug') {
      const log = this.opt.log;
      if (!this.opt.debug) {
        return;
      }
      if (typeof log === 'object' && typeof log[level] === 'function') {
        log[level](`mark.js: ${msg}`);
      }
    }
    getSeparatedKeywords(sv) {
      let stack = [];
      sv.forEach(kw => {
        if (!this.opt.separateWordSearch) {
          if (kw.trim() && stack.indexOf(kw) === -1) {
            stack.push(kw);
          }
        } else {
          kw.split(' ').forEach(kwSplitted => {
            if (kwSplitted.trim() && stack.indexOf(kwSplitted) === -1) {
              stack.push(kwSplitted);
            }
          });
        }
      });
      return {
        'keywords': stack.sort((a, b) => {
          return b.length - a.length;
        }),
        'length': stack.length
      };
    }
    isNumeric(value) {
      return Number(parseFloat(value)) == value;
    }
    checkRanges(array) {
      if (
        !Array.isArray(array) ||
        Object.prototype.toString.call(array[0]) !== '[object Object]'
      ) {
        this.log('markRanges() will only accept an array of objects');
        this.opt.noMatch(array);
        return [];
      }
      const stack = [];
      let last = 0;
      array
        .sort((a, b) => {
          return a.start - b.start;
        })
        .forEach(item => {
          let {start, end, valid} = this.callNoMatchOnInvalidRanges(item, last);
          if (valid) {
            item.start = start;
            item.length = end - start;
            stack.push(item);
            if ( !this.opt.wrapAllRanges) {
              last = end;
            }
          }
        });
      return stack;
    }
    callNoMatchOnInvalidRanges(range, last) {
      let start, end,
        valid = false;
      if (range && typeof range.start !== 'undefined') {
        start = parseInt(range.start, 10);
        end = start + parseInt(range.length, 10);
        if (
          this.isNumeric(range.start) &&
          this.isNumeric(range.length) &&
          start >= last &&
          end > start
        ) {
          valid = true;
        } else {
          this.log(
            'Ignoring invalid or overlapping range: ' +
            `${JSON.stringify(range)}`
          );
          this.opt.noMatch(range);
        }
      } else {
        this.log(`Ignoring invalid range: ${JSON.stringify(range)}`);
        this.opt.noMatch(range);
      }
      return {
        start: start,
        end: end,
        valid: valid
      };
    }
    checkWhitespaceRanges(range, originalLength, string) {
      let end,
        valid = true,
        max = string.length,
        offset = originalLength - max,
        start = parseInt(range.start, 10) - offset;
      start = start > max ? max : start;
      end = start + parseInt(range.length, 10);
      if (end > max) {
        end = max;
        this.log(`End range automatically set to the max value of ${max}`);
      }
      if (start < 0 || end - start <= 0) {
        valid = false;
        this.log(`Invalid range: ${JSON.stringify(range)}`);
        this.opt.noMatch(range);
      } else if ( !/\S/.test(string.substring(start, end))) {
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
    checkParents(textNode, checkName) {
      if (textNode === textNode.parentNode.lastChild) {
        if (checkName(textNode.parentNode)) {
          return true;
        } else {
          let parent = textNode.parentNode;
          while (parent === parent.parentNode.lastChild) {
            if (checkName(parent.parentNode)) {
              return true;
            }
            parent = parent.parentNode;
          }
        }
        let node = textNode.parentNode.nextSibling;
        if (node) {
          if (node.nodeType === 1) {
            if ((checkName(node))) {
              return true;
            }
          } else {
            return true;
          }
        }
      }
      return false;
    }
    checkNextSiblings(node, checkName) {
      if (node && node.nodeType === 1) {
        if (checkName(node)) {
          return;
        } else if (node.firstChild) {
          let prevFirstChild, child = node.firstChild;
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
    prepare(tags) {
      let str = '\u0001 ', boundary = this.opt.blockElementsBoundary;
      if (boundary.tagNames && boundary.tagNames.length) {
        let elements = {};
        for (let key in boundary.tagNames) {
          elements[boundary.tagNames[key].toLowerCase()] = 1;
        }
        for (let key in elements) {
          tags[key] = 2;
        }
      } else {
        for (let key in tags) {
          tags[key] = 2;
        }
        tags['br'] = 1;
      }
      if (boundary.char) {
        str = boundary.char.charAt(0) + ' ';
      }
      return str;
    }
    getTextNodesAcrossElements(cb) {
      if (this.opt.cacheTextNodes && this.cacheDict.nodes) {
        this.cacheDict.lastIndex = 0;
        this.cacheDict.lastTextIndex = 0;
        cb(this.cacheDict);
        return;
      }
      let val = '', start, text, endBySpace, type, offset,
        startOffset = 0, nodes = [],
        boundary = this.opt.blockElementsBoundary,
        str, str2;
      let tags = { div : 1, p : 1, li : 1, td : 1, tr : 1, th : 1, ul : 1,
        ol : 1, br : 1, dd : 1, dl : 1, dt : 1, h1 : 1, h2 : 1, h3 : 1, h4 : 1,
        h5 : 1, h6 : 1, hr : 1, blockquote : 1, figcaption : 1, figure : 1,
        pre : 1, table : 1, thead : 1, tbody : 1, tfoot : 1, input : 1,
        img : 1, nav : 1, details : 1, label : 1, form : 1, select : 1, menu : 1,
        menuitem : 1,
        main : 1, section : 1, article : 1, aside : 1, picture : 1, output : 1,
        button : 1, header : 1, footer : 1, address : 1, area : 1, canvas : 1,
        map : 1, fieldset : 1, textarea : 1, track : 1, video : 1, audio : 1,
        body : 1, iframe : 1, meter : 1, object : 1, svg : 1 };
      if (boundary) {
        str = this.prepare(tags);
        str2 = ' ' + str;
      }
      this.iterator.forEachNode(NodeFilter.SHOW_TEXT, node => {
        offset = 0;
        start = val.length;
        text = node.textContent;
        endBySpace = /\s/.test(text[text.length - 1]);
        if (boundary || !endBySpace) {
          let success = this.checkParents(node, nd => {
            type = tags[nd.nodeName.toLowerCase()];
            return type;
          });
          if ( !success) {
            this.checkNextSiblings(node.nextSibling, nd => {
              type = tags[nd.nodeName.toLowerCase()];
              return type;
            });
          }
          if (type) {
            if ( !endBySpace) {
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
          offset : offset,
          startOffset : startOffset,
          node: node
        });
        startOffset -= offset;
      }, node => {
        if (this.matchesExclude(node.parentNode)) {
          return NodeFilter.FILTER_REJECT;
        } else {
          return NodeFilter.FILTER_ACCEPT;
        }
      }, () => {
        const dict = {
          value: val,
          nodes: nodes,
          lastIndex: 0,
          lastTextIndex: 0
        };
        if (this.opt.cacheTextNodes) {
          this.cacheDict = dict;
        }
        cb(dict);
      });
    }
    getTextNodes(cb) {
      if (this.opt.cacheTextNodes && this.cacheDict.nodes) {
        cb(this.cacheDict);
        return;
      }
      let val = '',
        nodes = [];
      this.iterator.forEachNode(NodeFilter.SHOW_TEXT, node => {
        nodes.push({
          start: val.length,
          end: (val += node.textContent).length,
          offset : 0,
          node: node
        });
      }, node => {
        if (this.matchesExclude(node.parentNode)) {
          return NodeFilter.FILTER_REJECT;
        } else {
          return NodeFilter.FILTER_ACCEPT;
        }
      }, () => {
        const dict = {
          value: val,
          nodes: nodes,
          lastIndex: 0,
          lastTextIndex: 0
        };
        if (this.opt.cacheTextNodes) {
          this.cacheDict = dict;
        }
        cb(dict);
      });
    }
    matchesExclude(el) {
      return DOMIterator.matches(el, this.opt.exclude.concat([
        'script', 'style', 'title', 'head', 'html'
      ]));
    }
    wrapRangeInTextNode(node, start, end) {
      const startNode = node.splitText(start),
        retNode = startNode.splitText(end - start);
      this.createMarkElement(startNode);
      return  retNode;
    }
    createMarkElement(node) {
      const name = !this.opt.element ? 'mark' : this.opt.element;
      let markNode = document.createElement(name);
      markNode.setAttribute('data-markjs', 'true');
      if (this.opt.className) {
        markNode.setAttribute('class', this.opt.className);
      }
      markNode.textContent = node.textContent;
      node.parentNode.replaceChild(markNode, node);
      return  markNode;
    }
    wrapRangeInTextNodeInsert(dict, n, s, e, start, index) {
      let ended = e === n.node.textContent.length;
      if (s === 0 && ended) {
        let markNode = this.createMarkElement(n.node);
        n.node = markNode.childNodes[0];
        return { retNode : n, markNode, increment : 0 };
      }
      let node = n.node.splitText(s),
        restNode = node.splitText(e - s),
        markNode = this.createMarkElement(node),
        increment = 1;
      let mNode = {
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
      return { retNode, markNode, increment };
    }
    wrapRangeInMappedTextNode(dict, start, end, filterCb, eachCb) {
      let i = dict.lastIndex,
        rangeStart = true;
      if (this.opt.wrapAllRanges) {
        while (i >= 0 && dict.nodes[i].start > start) {
          i--;
        }
      } else if (start < dict.lastTextIndex) {
        this.log('The attempt to wrap overlapping range.');
        return;
      }
      for (i; i < dict.nodes.length; i++)  {
        if (i + 1 === dict.nodes.length || dict.nodes[i+1].start > start) {
          let n = dict.nodes[i];
          if (!filterCb(n)) {
            if (i > dict.lastIndex) {
              dict.lastIndex = i;
            }
            break;
          }
          const s = start - n.start,
            e = (end > n.end ? n.end : end) - n.start;
          if (s >= 0 && e > s) {
            if (this.opt.wrapAllRanges) {
              let ret =
                this.wrapRangeInTextNodeInsert(dict, n, s, e, start, i);
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
    wrapGroups(node, pos, len, eachCb) {
      node = this.wrapRangeInTextNode(node, pos, pos + len);
      eachCb(node.previousSibling);
      return node;
    }
    separateGroupsD(node, match, params, filterCb, eachCb) {
      let lastIndex = 0,
        offset = 0,
        i = 0,
        isWrapped = false,
        group, start, end = 0;
      while (++i < match.length) {
        group = match[i];
        if (group) {
          start = match.indices[i][0];
          if (start >= lastIndex) {
            end = match.indices[i][1];
            if (filterCb(group, node, i)) {
              node = this.wrapGroups(node, start - offset, end - start, node => {
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
    separateGroups(node, match, params, filterCb, eachCb) {
      let startIndex = match.index,
        i = -1,
        isWrapped = false,
        index, group, start;
      while (++i < params.groups.length) {
        index = params.groups[i];
        group = match[index];
        if (group) {
          start = node.textContent.indexOf(group, startIndex);
          if (start !== -1) {
            if (filterCb(group, node, index)) {
              node = this.wrapGroups(node, start, group.length, node => {
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
    wrapMatchGroupsD(dict, match, params, filterCb, eachCb) {
      let lastIndex = 0,
        i = 0,
        group, start, end = 0,
        isWrapped;
      while (++i < match.length) {
        group = match[i];
        if (group) {
          start = match.indices[i][0];
          if (this.opt.wrapAllRanges || start >= lastIndex) {
            end = match.indices[i][1];
            isWrapped = false;
            this.wrapRangeInMappedTextNode(dict, start, end, obj => {
              return filterCb(group, obj.node, i);
            }, (node, groupStart) => {
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
    setLastIndex(regex, end) {
      if (end > regex.lastIndex) {
        regex.lastIndex = end;
      } else if (end > 0) {
        regex.lastIndex++;
      } else {
        regex.lastIndex = Infinity;
      }
    }
    wrapMatchGroups(dict, match, params, filterCb, eachCb) {
      let startIndex = 0,
        index = 0,
        group, start, end;
      const s = match.index,
        text = match[0];
      if (this.opt.wrapAllRanges) {
        this.wrapRangeInMappedTextNode(dict, s, s + text.length, obj => {
          return filterCb(text, obj.node, index);
        }, function(node, groupStart) {
          eachCb(node, groupStart, index);
        });
      }
      for (let i = 0; i < params.groups.length; i++) {
        index = params.groups[i];
        group = match[index];
        if (group) {
          start = text.indexOf(group, startIndex);
          end = start + group.length;
          if (start !== -1) {
            this.wrapRangeInMappedTextNode(dict, s + start, s + end, obj => {
              return filterCb(group, obj.node, index);
            }, (node, groupStart) => {
              eachCb(node, groupStart, index);
            });
            startIndex = end;
          }
        }
      }
    }
    collectRegexGroupIndexes(regex) {
      let groups = [], stack = [],
        i = -1, index = 1, brackets = 0, charsRange = false,
        str = regex.source,
        reg = /^\(\?<(?![=!])|^\((?!\?)/;
      while (++i < str.length) {
        switch (str[i]) {
          case '(':
            if ( !charsRange) {
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
            if ( !charsRange && stack.pop() === 1) {
              brackets--;
            }
            break;
          case '\\' : i++; break;
          case '[' : charsRange = true; break;
          case ']' : charsRange = false; break;
          default : break;
        }
      }
      return groups;
    }
    wrapSeparateGroups(regex, unused, filterCb, eachCb, endCb) {
      const fn = regex.hasIndices ? 'separateGroupsD' : 'separateGroups',
        params = {
          regex : regex,
          groups : regex.hasIndices ? {} : this.collectRegexGroupIndexes(regex)
        },
        execution = { abort : false },
        filterInfo = { execution : execution };
      let node, match, matchStart, eMatchStart, count = 0;
      this.getTextNodes(dict => {
        dict.nodes.every(nd => {
          node = nd.node;
          filterInfo.offset = nd.start;
          while (
            (match = regex.exec(node.textContent)) !== null &&
            (regex.hasIndices || match[0] !== '')
          ) {
            filterInfo.match = match;
            matchStart = eMatchStart = true;
            node = this[fn](node, match, params, (group, node, groupIndex) => {
              filterInfo.matchStart = matchStart;
              filterInfo.groupIndex = groupIndex;
              matchStart = false;
              return  filterCb(group, node, filterInfo);
            }, (node, groupIndex) => {
              if (eMatchStart) {
                count++;
              }
              eachCb(node, {
                match : match,
                matchStart : eMatchStart,
                count : count,
                groupIndex : groupIndex,
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
    wrapMatches(regex, ignoreGroups, filterCb, eachCb, endCb) {
      const index = ignoreGroups === 0 ? 0 : ignoreGroups + 1,
        execution = { abort : false },
        filterInfo = { execution : execution };
      let info, node, match, count = 0;
      this.getTextNodes(dict => {
        for (let k = 0; k < dict.nodes.length; k++) {
          info = dict.nodes[k];
          node = info.node;
          while (
            (match = regex.exec(node.textContent)) !== null &&
            match[index] !== ''
          ) {
            filterInfo.match = match;
            filterInfo.offset = info.start;
            if (!filterCb(match[index], node, filterInfo)) {
              continue;
            }
            let len = match[index].length,
              start = match.index;
            if (index !== 0) {
              for (let i = 1; i < index; i++) {
                start += match[i].length;
              }
            }
            if (this.opt.cacheTextNodes) {
              const ret = this.wrapRangeInTextNodeInsert(
                dict, info, start, start + len, info.start + start, k
              );
              count++;
              eachCb(ret.markNode, {
                match : match,
                count : count,
              });
              if (ret.increment === 0) {
                regex.lastIndex = 0;
                break;
              }
              k += ret.increment;
              info = ret.retNode;
              node = info.node;
            } else {
              node = this.wrapGroups(node, start, len, node => {
                count++;
                eachCb(node, {
                  match : match,
                  count : count,
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
    wrapGroupsAcrossElements(regex, unused, filterCb, eachCb, endCb) {
      const fn = regex.hasIndices ? 'wrapMatchGroupsD' : 'wrapMatchGroups',
        params = {
          regex : regex,
          groups : regex.hasIndices ? {} : this.collectRegexGroupIndexes(regex)
        },
        execution = { abort : false },
        filterInfo = { execution : execution };
      let match, matchStart, eMatchStart, count = 0;
      this.getTextNodesAcrossElements(dict => {
        while (
          (match = regex.exec(dict.value)) !== null &&
          (regex.hasIndices || match[0] !== '')
        ) {
          filterInfo.match = match;
          matchStart = eMatchStart = true;
          this[fn](dict, match, params, (group, node, groupIndex) => {
            filterInfo.matchStart = matchStart;
            filterInfo.groupIndex = groupIndex;
            matchStart = false;
            return  filterCb(group, node, filterInfo);
          }, (node, groupStart, groupIndex) => {
            if (eMatchStart) {
              count++;
            }
            eachCb(node, {
              match : match,
              matchStart : eMatchStart,
              count : count,
              groupIndex : groupIndex,
              groupStart : groupStart,
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
    wrapMatchesAcrossElements(regex, ignoreGroups, filterCb, eachCb, endCb) {
      const index = ignoreGroups === 0 ? 0 : ignoreGroups + 1,
        execution = { abort : false },
        filterInfo = { execution : execution };
      let match, matchStart, count = 0;
      this.getTextNodesAcrossElements(dict => {
        while (
          (match = regex.exec(dict.value)) !== null &&
          match[index] !== ''
        ) {
          filterInfo.match = match;
          matchStart = true;
          let start = match.index;
          if (index !== 0) {
            for (let i = 1; i < index; i++) {
              start += match[i].length;
            }
          }
          const end = start + match[index].length;
          this.wrapRangeInMappedTextNode(dict, start, end, obj => {
            filterInfo.matchStart = matchStart;
            filterInfo.offset = obj.startOffset;
            matchStart = false;
            return filterCb(match[index], obj.node, filterInfo);
          }, (node, matchStart) => {
            if (matchStart) {
              count++;
            }
            eachCb(node, {
              match : match,
              matchStart : matchStart,
              count : count,
            });
          });
          if (execution.abort) {
            break;
          }
        }
        endCb(count, dict);
      });
    }
    wrapRangeFromIndex(ranges, filterCb, eachCb, endCb) {
      let count = 0;
      this.getTextNodes(dict => {
        const originalLength = dict.value.length;
        ranges.forEach((range, counter) => {
          let {start, end, valid} = this.checkWhitespaceRanges(
            range,
            originalLength,
            dict.value
          );
          if (valid) {
            this.wrapRangeInMappedTextNode(dict, start, end, obj => {
              return filterCb(
                obj.node,
                range,
                dict.value.substring(start, end),
                counter
              );
            }, (node, rangeStart) => {
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
    unwrapMatches(node) {
      const parent = node.parentNode;
      let docFrag = document.createDocumentFragment();
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
    normalizeTextNode(node) {
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
    markRegExp(regexp, opt) {
      this.opt = opt;
      let totalMarks = 0,
        fn = this.getMethodName(opt);
      if (this.opt.acrossElements) {
        if ( !regexp.global && !regexp.sticky) {
          let splits = regexp.toString().split('/');
          regexp = new RegExp(regexp.source, 'g' + splits[splits.length-1]);
          this.log(
            'RegExp is recompiled with g flag because it must have g flag'
          );
        }
      }
      this.log(`Searching with expression "${regexp}"`);
      this[fn](regexp, this.opt.ignoreGroups, (match, node, filterInfo) => {
        return this.opt.filter(node, match, totalMarks, filterInfo);
      }, (element, matchInfo) => {
        totalMarks++;
        this.opt.each(element, matchInfo);
      }, (totalMatches) => {
        if (totalMatches === 0) {
          this.opt.noMatch(regexp);
        }
        this.opt.done(totalMarks, totalMatches);
      });
    }
    mark(sv, opt) {
      this.opt = opt;
      let index = 0,
        totalMarks = 0,
        totalMatches = 0;
      const fn =
        this.opt.acrossElements ? 'wrapMatchesAcrossElements' : 'wrapMatches',
        termStats = {};
      const { keywords, length } =
        this.getSeparatedKeywords(typeof sv === 'string' ? [sv] : sv),
        handler = kw => {
          const regex = new RegExpCreator(this.opt).create(kw);
          let matches = 0;
          this.log(`Searching with expression "${regex}"`);
          this[fn](regex, 1, (term, node, filterInfo) => {
            return this.opt.filter(node, kw, totalMarks, matches, filterInfo);
          }, (element, matchInfo) => {
            matches++;
            totalMarks++;
            this.opt.each(element, matchInfo);
          }, (count) => {
            totalMatches += count;
            if (count === 0) {
              this.opt.noMatch(kw);
            }
            termStats[kw] = count;
            if (++index < length) {
              handler(keywords[index]);
            } else {
              this.opt.done(totalMarks, totalMatches, termStats);
            }
          });
        };
      if (length === 0) {
        this.opt.done(0, 0, termStats);
      } else {
        handler(keywords[index]);
      }
    }
    getMethodName(opt) {
      if (opt) {
        if (opt.acrossElements) {
          if (opt.separateGroups) {
            return  'wrapGroupsAcrossElements';
          }
          return  'wrapMatchesAcrossElements';
        }
        if (opt.separateGroups) {
          return  'wrapSeparateGroups';
        }
      }
      return 'wrapMatches';
    }
    markRanges(rawRanges, opt) {
      this.opt = opt;
      let totalMarks = 0,
        ranges = this.checkRanges(rawRanges);
      if (ranges && ranges.length) {
        this.log(
          'Starting to mark with the following ranges: ' +
          JSON.stringify(ranges)
        );
        this.wrapRangeFromIndex(
          ranges, (node, range, match, counter) => {
            return this.opt.filter(node, range, match, counter);
          }, (element, range) => {
            totalMarks++;
            this.opt.each(element, range);
          }, (totalMatches) => {
            this.opt.done(totalMarks, totalMatches);
          }
        );
      } else {
        this.opt.done(0, 0);
      }
    }
    unmark(opt) {
      this.opt = opt;
      let sel = this.opt.element ? this.opt.element : '*';
      sel += '[data-markjs]';
      if (this.opt.className) {
        sel += `.${this.opt.className}`;
      }
      this.log(`Removal selector "${sel}"`);
      this.iterator.forEachNode(NodeFilter.SHOW_ELEMENT, node => {
        this.unwrapMatches(node);
      }, node => {
        const matchesSel = DOMIterator.matches(node, sel),
          matchesExclude = this.matchesExclude(node);
        if (!matchesSel || matchesExclude) {
          return NodeFilter.FILTER_REJECT;
        } else {
          return NodeFilter.FILTER_ACCEPT;
        }
      }, this.opt.done);
    }
  }

  function Mark$1(ctx) {
    const instance = new Mark(ctx);
    this.mark = (sv, opt) => {
      instance.mark(sv, opt);
      return this;
    };
    this.markRegExp = (sv, opt) => {
      instance.markRegExp(sv, opt);
      return this;
    };
    this.markRanges = (sv, opt) => {
      instance.markRanges(sv, opt);
      return this;
    };
    this.unmark = (opt) => {
      instance.unmark(opt);
      return this;
    };
    return this;
  }

  return Mark$1;

})));
