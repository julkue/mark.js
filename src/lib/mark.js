import DOMIterator from './domiterator';
import RegExpCreator from './regexpcreator';

/**
 * Marks search terms in DOM elements
 * @example
 * new Mark(document.querySelector('.context')).mark('lorem ipsum');
 * @example
 * new Mark(document.querySelector('.context')).markRegExp(/lorem/gmi);
 * @example
 * new Mark('.context').markRanges([{start:10,length:0}]);
 */
class Mark {

  /**
   * @param {HTMLElement|HTMLElement[]|NodeList|string} ctx - The context DOM
   * element, an array of DOM elements, a NodeList or a selector
   */
  constructor(ctx) {
    /**
     * The context of the instance. Either a DOM element, an array of DOM
     * elements, a NodeList or a selector
     * @type {HTMLElement|HTMLElement[]|NodeList|string}
     * @access protected
     */
    this.ctx = ctx;
    /**
     * Specifies if the current browser is a IE (necessary for the node
     * normalization bug workaround). See {@link Mark#unwrapMatches}
     * @type {boolean}
     * @access protected
     */
    this.ie = false;
    const ua = window.navigator.userAgent;
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
      this.ie = true;
    }
  }

  /**
   * Options defined by the user. They will be initialized from one of the
   * public methods. See {@link Mark#mark}, {@link Mark#markRegExp},
   * {@link Mark#markRanges} and {@link Mark#unmark} for option properties.
   * @type {object}
   * @param {object} [val] - An object that will be merged with defaults
   * @access protected
   */
  set opt(val) {
    this._opt = Object.assign({}, {
      'element': '',
      'className': '',
      'exclude': [],
      'iframes': false,
      'iframesTimeout': 5000,
      'separateWordSearch': true,
      'acrossElements': false,
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

  /**
   * An instance of DOMIterator
   * @type {DOMIterator}
   * @access protected
   */
  get iterator() {
    // always return new instance in case there were option changes
    return new DOMIterator(
      this.ctx,
      this.opt.iframes,
      this.opt.exclude,
      this.opt.iframesTimeout
    );
  }

  /**
   * Logs a message if log is enabled
   * @param {string} msg - The message to log
   * @param {string} [level="debug"] - The log level, e.g. <code>warn</code>
   * <code>error</code>, <code>debug</code>
   * @access protected
   */
  log(msg, level = 'debug') {
    const log = this.opt.log;
    if (!this.opt.debug) {
      return;
    }
    if (typeof log === 'object' && typeof log[level] === 'function') {
      log[level](`mark.js: ${msg}`);
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
      // sort because of https://git.io/v6USg
      'keywords': stack.sort((a, b) => {
        return b.length - a.length;
      }),
      'length': stack.length
    };
  }

  /**
   * Check if a value is a number
   * @param {number|string} value - the value to check;
   * numeric strings allowed
   * @return {boolean}
   * @access protected
   */
  isNumeric(value) {
    // http://stackoverflow.com/a/16655847/145346
    // eslint-disable-next-line eqeqeq
    return Number(parseFloat(value)) == value;
  }

  /**
   * @typedef Mark~rangeObject
   * @type {object}
   * @property {number} start - The start position within the composite value
   * @property {number} length - The length of the string to mark within the
   * composite value.
   */

  /**
   * @typedef Mark~setOfRanges
   * @type {object[]}
   * @property {Mark~rangeObject}
   */
  /**
   * Returns a processed list of integer offset indexes that do not overlap
   * each other, and remove any string values or additional elements
   * @param {Mark~setOfRanges} array - unprocessed raw array
   * @return {Mark~setOfRanges} - processed array with any invalid entries
   * removed
   * @throws Will throw an error if an array of objects is not passed
   * @access protected
   */
  checkRanges(array) {
    // start and length indexes are included in an array of objects
    // [{start: 0, length: 1}, {start: 4, length: 5}]
    // quick validity check of the first entry only
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
    // ensure there is no overlap in start & end offsets
      .sort((a, b) => {
        return a.start - b.start;
      })
      .forEach(item => {
        let {start, end, valid} = this.callNoMatchOnInvalidRanges(item, last);
        if (valid) {
          // preserve item in case there are extra key:values within
          item.start = start;
          item.length = end - start;
          stack.push(item);
          last = end;
        }
      });
    return stack;
  }

  /**
   * @typedef Mark~validObject
   * @type {object}
   * @property {number} start - The start position within the composite value
   * @property {number} end - The calculated end position within the composite
   * value.
   * @property {boolean} valid - boolean value indicating that the start and
   * calculated end range is valid
   */
  /**
   * Initial validation of ranges for markRanges. Preliminary checks are done
   * to ensure the start and length values exist and are not zero or non-
   * numeric
   * @param {Mark~rangeObject} range - the current range object
   * @param {number} last - last index of range
   * @return {Mark~validObject}
   * @access protected
   */
  callNoMatchOnInvalidRanges(range, last) {
    let start, end,
      valid = false;
    if (range && typeof range.start !== 'undefined') {
      start = parseInt(range.start, 10);
      end = start + parseInt(range.length, 10);
      // ignore overlapping values & non-numeric entries
      if (
        this.isNumeric(range.start) &&
        this.isNumeric(range.length) &&
        end - last > 0 &&
        end - start > 0
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

  /**
   * Check valid range for markRanges. Check ranges with access to the context
   * string. Range values are double checked, lengths that extend the mark
   * beyond the string length are limited and ranges containing only
   * whitespace are ignored
   * @param {Mark~rangeObject} range - the current range object
   * @param {number} originalLength - original length of the context string
   * @param {string} string - current content string
   * @return {Mark~validObject}
   * @access protected
   */
  checkWhitespaceRanges(range, originalLength, string) {
    let end,
      valid = true,
      // the max value changes after the DOM is manipulated
      max = string.length,
      // adjust offset to account for wrapped text node
      offset = originalLength - max,
      start = parseInt(range.start, 10) - offset;
    // make sure to stop at max
    start = start > max ? max : start;
    end = start + parseInt(range.length, 10);
    if (end > max) {
      end = max;
      this.log(`End range automatically set to the max value of ${max}`);
    }
    if (start < 0 || end - start < 0 || start > max || end > max) {
      valid = false;
      this.log(`Invalid range: ${JSON.stringify(range)}`);
      this.opt.noMatch(range);
    } else if (string.substring(start, end).replace(/\s+/g, '') === '') {
      valid = false;
      // whitespace only; even if wrapped it is not visible
      this.log('Skipping whitespace only range: ' + JSON.stringify(range));
      this.opt.noMatch(range);
    }
    return {
      start: start,
      end: end,
      valid: valid
    };
  }

  /**
  * @param {HTMLElement} textNode - The DOM text node element
  * @param {object} tags - The object containing HTMLElement names
  * @return {number}
  */
  checkParents(textNode, tags) {
    let value = 0;
    if (textNode === textNode.parentNode.lastChild) {
      if ((value = tags[textNode.parentNode.nodeName.toLowerCase()])) {
        return value;

      } else {
        // loop through textNode parent nodes which are last child
        let parent = textNode.parentNode;
        while (parent === parent.parentNode.lastChild) {
          if ((value = tags[parent.parentNode.nodeName.toLowerCase()])) {
            return value;
          }
          parent = parent.parentNode;
        }
      }
      // textNode is last child of inline element so check parent next sibling
      let node = textNode.parentNode.nextSibling;
      if (node && node.nodeType === 1
        && ((value = tags[node.nodeName.toLowerCase()]))) {
        return value;
      }
    }
    return -1;
  }

  /**
  * @param {HTMLElement} node - The DOM node element
  * @param {object} tags - The object containing HTMLElement names
  * @return {number}
  */
  checkNextNodes(node, tags) {
    let value = 0;
    if (node && node.nodeType === 1) {
      if ((value = tags[node.nodeName.toLowerCase()])) {
        return value;

      } else if (node.firstChild) {
        // loop through firstChilds until condition is met
        let prevNode, child = node.firstChild;
        while (child) {
          if (child.nodeType === 1) {
            if ((value = tags[child.nodeName.toLowerCase()])) {
              return value;
            }
            prevNode = child;
            child = child.firstChild;
            continue;
          }
          // most likely child is text node
          return -1;
        }
        // prevNode has no child nodes so check next sibling
        return this.checkNextNodes(prevNode.nextSibling, tags);
      }
      if (node !== node.parentNode.lastChild) {
        // node has no child nodes so check next sibling
        return this.checkNextNodes(node.nextSibling, tags);

      } else if ((value = tags[node.parentNode.nodeName.toLowerCase()])) {
        return value;
      }
    }
    return -1;
  }

  /**
  * @typedef Mark~getTextNodesAcrossElementsDict
  * @type {object.<string>}
  * @property {string} value - The composite value of all text nodes
  * @property {object[]} nodes - An array of objects
  * @property {number} lastIndex - The property used to store the nodes last
  * index
  * @property {number} nodes.start - The start position within the composite
  * value
  * @property {number} nodes.end - The end position within the composite
  * value
  * @property {number} nodes.offset - The offset used to correct position
  * if space or string was added to the end of the text node
  * @property {HTMLElement} nodes.node - The DOM text node element
  */

  /**
  * Callback
  * @callback Mark~getTextNodesAcrossElementsCallback
  * @param {Mark~getTextNodesAcrossElementsDict}
  */
  /**
  * Calls the callback with an object containing all text nodes (including
  * iframe text nodes) with start and end positions and the composite value
  * of them (string)
  * @param {Mark~getTextNodesAcrossElementsCallback} cb - Callback
  * @access protected
  */
  getTextNodesAcrossElements(cb) {
    let val = '', start, text, endBySpace, number, offset, nodes = [],
      str = this.opt.boundaryChar
        ? this.opt.boundaryChar.charAt(0) + ' ' : '\u0001 ',
      str2 = ' ' + str;

    // the space can be safely added to the end of a text node when
    // the node checks run across element with one of those names
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

    if (this.opt.blockElementsBoundary) {
      if (this.opt.blockElements && this.opt.blockElements.length) {
        // normalize custom blockElements names
        let elements = {};
        for (let key in this.opt.blockElements) {
          elements[this.opt.blockElements[key].toLowerCase()] = 1;
        }
        // it also allows adding custom element names
        for (let key in elements) {
          tags[key] = 2;
        }
      } else {
        for (let key in tags) {
          tags[key] = 2;
        }
        // br is inline element. Currently is under question. 
        tags['br'] = 1;
      }
    }

    this.iterator.forEachNode(NodeFilter.SHOW_TEXT, node => {
      offset = 0;
      start = val.length;
      text = node.textContent;
      endBySpace = /\s/.test(text[text.length - 1]);

      // in this implementation a space or string can be added only to the end
      // of a text and 'lookahead' is only way to check parents and siblings
      if (this.opt.blockElementsBoundary || !endBySpace) {
        number = this.checkParents(node, tags);
        if (number === -1) {
          number = this.checkNextNodes(node.nextSibling, tags);
        }
        if (number > 0) {
          if ( !endBySpace) {
            if (number === 1) {
              val += text + ' ';
              offset = 1;
            } else if (number === 2) {
              val += text + str2;
              offset = 3;
            }
          } else if (number === 2) {
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
        node
      });
    }, node => {
      if (this.matchesExclude(node.parentNode)) {
        return NodeFilter.FILTER_REJECT;
      } else {
        return NodeFilter.FILTER_ACCEPT;
      }
    }, () => {
      cb({
        value: val,
        nodes: nodes,
        lastIndex : 0
      });
    });
  }

  /**
   * @typedef Mark~getTextNodesDict
   * @type {object.<string>}
   * @property {string} value - The composite value of all text nodes
   * @property {object[]} nodes - An array of objects
   * @property {number} lastIndex - The property used to store the nodes last
   * index
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
    let val = '',
      nodes = [];
    this.iterator.forEachNode(NodeFilter.SHOW_TEXT, node => {
      nodes.push({
        start: val.length,
        end: (val += node.textContent).length,
        node
      });
    }, node => {
      if (this.matchesExclude(node.parentNode)) {
        return NodeFilter.FILTER_REJECT;
      } else {
        return NodeFilter.FILTER_ACCEPT;
      }
    }, () => {
      cb({
        value: val,
        nodes: nodes,
        lastIndex : 0
      });
    });
  }

  /**
   * Checks if an element matches any of the specified exclude selectors. Also
   * it checks for elements in which no marks should be performed (e.g.
   * script and style tags) and optionally already marked elements
   * @param  {HTMLElement} el - The element to check
   * @return {boolean}
   * @access protected
   */
  matchesExclude(el) {
    return DOMIterator.matches(el, this.opt.exclude.concat([
      // ignores the elements itself, not their childrens (selector *)
      'script', 'style', 'title', 'head', 'html'
    ]));
  }

  /**
   * Wraps the instance element and class around matches that fit the start and
   * end positions within the node
   * @param  {HTMLElement} node - The DOM text node
   * @param  {number} start - The position where to start wrapping
   * @param  {number} end - The position where to end wrapping
   * @return {HTMLElement} Returns the splitted text node that will appear
   * after the wrapped text node
   * @access protected
   */
  wrapRangeInTextNode(node, start, end) {
    const hEl = !this.opt.element ? 'mark' : this.opt.element,
      startNode = node.splitText(start),
      ret = startNode.splitText(end - start);
    let repl = document.createElement(hEl);
    repl.setAttribute('data-markjs', 'true');
    if (this.opt.className) {
      repl.setAttribute('class', this.opt.className);
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
   * @property {number} lastIndex - The property used to store the nodes last
   * index
   * @property {number} nodes.start - The start position within the composite
   * value
   * @property {number} nodes.end - The end position within the composite
   * value
   * @property {number} nodes.offset - The offset used to correct position
   * if space or string was added to the end of the text node
   * @property {HTMLElement} nodes.node - The DOM text node element
   */
  /**
   * Each callback
   * @callback Mark~wrapRangeInMappedTextNodeEachCallback
   * @param {HTMLElement} node - The wrapped DOM element
   * @param {boolean} rangeStart - indicate the start of the current range
   */

  /**
   * Filter callback
   * @callback Mark~wrapRangeInMappedTextNodeFilterCallback
   * @param {HTMLElement} node - The matching text node DOM element
   */
  /**
   * Determines matches by start and end positions using the text node
   * dictionary even across text nodes and calls
   * {@link Mark#wrapRangeInTextNode} to wrap them
   * @param  {Mark~wrapRangeInMappedTextNodeDict} dict - The dictionary
   * @param  {number} start - The start position of the match
   * @param  {number} end - The end position of the match
   * @param  {Mark~wrapRangeInMappedTextNodeFilterCallback} filterCb - Filter
   * callback
   * @param  {Mark~wrapRangeInMappedTextNodeEachCallback} eachCb - Each
   * callback
   * @access protected
   */
  wrapRangeInMappedTextNode(dict, start, end, filterCb, eachCb) {
    let rangeStart = true;
    // dict.lastIndex store last node index to avoid iteration over all text
    // nodes to find the one matching the positions
    for (let i = dict.lastIndex; i < dict.nodes.length; i++)  {
      const sibl = dict.nodes[i + 1];
      if (typeof sibl === 'undefined' || sibl.start > start) {
        let n = dict.nodes[i];

        if (!filterCb(n.node)) {
          // update lastIndex
          if (i > dict.lastIndex) {
            dict.lastIndex = i;
          }
          break;
        }
        // map range from dict.value to text node
        const s = start - n.start,
          e = (end > n.end ? n.end : end) - n.start;
        // this check prevents create empty marked node
        if (e > s) {
          n.node = this.wrapRangeInTextNode(n.node, s, e);
          // set new text node start index in the case of subsequent matches
          // in the same text node.
          n.start += e;
          eachCb(n.node.previousSibling, rangeStart);
          rangeStart = false;
        }

        if (end > n.end) {
          // range extends to next node
          start = n.end + (n.offset ? n.offset : 0);
        } else {
          // set last index
          dict.lastIndex = i;
          break;
        }
      }
    }
  }

  /**
  * @param {HTMLElement} node - The text node where the match occurs
  * @param {number} pos - The current position of the match within the node
  * @param {number} len - The length of the current match within the node
  * @param {Mark~wrapMatchesEachCallback} eachCb
  */
  wrapGroups(node, pos, len, eachCb) {
    node = this.wrapRangeInTextNode(node, pos, pos + len);
    eachCb(node.previousSibling);
    return node;
  }

  /**
   * Separate groups
   * @param {HTMLElement} node - The text node where the match occurs
   * @param {array} match - The current match
   * @param {number} matchIdx - The start of the match based on ignoreGroups
   * @param {Mark~wrapMatchesFilterCallback} filterCb
   * @param {Mark~wrapMatchesEachCallback} eachCb
   */
  separateGroups(node, match, matchIdx, filterCb, eachCb) {
    let matchLen = match.length;
    for (let i = 1; i < matchLen; i++) {
      let pos = node.textContent.indexOf(match[i]);
      if (match[i] && pos > -1 && filterCb(match[i], node)) {
        node = this.wrapGroups(node, pos, match[i].length, eachCb);
      }
    }
    return node;
  }

  /**
  * Filter callback before each wrapping
  * @callback Mark~wrapMatchGroupsFilterCallback
  * @param {string} group - The current group matching string
  * @param {HTMLElement} node - The text node where the match occurs
  * @param {number} i - The current group index
  */
  /**
  * Callback for each wrapped element
  * @callback Mark~wrapMatchGroupsEachCallback
  * @param {HTMLElement} element - The marked DOM element
  * @param {boolean} matchStart - indicate the start of the current match
  * @param {boolean} groupStart - indicate the start of the current group
  * @param {number} i - The current group index
  */

  /**
  * Mark separate groups of the current match
  * @param {Mark~wrapMatchGroupsDict} dict - The dictionary
  * @param {array} match - The current match
  * @param {RegExp} regex - The regular expression to be searched for
  * @param {Mark~wrapMatchGroupsFilterCallback} filterCb - Filter
  * callback
  * @param {Mark~wrapMatchGroupsEachCallback} eachCb - Each callback
  */
  wrapMatchGroups(dict, match, regex, filterCb, eachCb) {
    let matchStart = true,
      max = 0,
      i = 1,
      group, start, end, isMarked;

    for (; i < match.length; i++) {
      group = match[i];
      if (group) {
        start = match.indices[i][0];
        //it prevents marking nested group - parent group is already marked
        if (start >= max) {
          end = match.indices[i][1];

          isMarked = false;
          this.wrapRangeInMappedTextNode(dict, start, end, node => {
            return filterCb(group, node, i);
          }, (node, groupStart) => {
            isMarked = true;
            eachCb(node, matchStart, groupStart, i);
            matchStart = false;
          });
          // group may be filtered out
          if (isMarked && end > max) {
            max = end;
          }
        }
      }
    }
  }

  /**
  * Filter callback before each wrapping
  * @callback Mark~wrapMatchGroups2FilterCallback
  * @param {string} group - The current group matching string
  * @param {HTMLElement} node - The text node where the match occurs
  * @param {number} i - The current group index
  */
  /**
  * Callback for each wrapped element
  * @callback Mark~wrapMatchGroups2EachCallback
  * @param {HTMLElement} element - The marked DOM element
  * @param {boolean} matchStart - indicate the start of the current match
  * @param {boolean} groupStart - indicate the start of the current group
  * @param {number} i - The current group index
  */

  /**
  * Mark separate groups of the current match
  * @param {Mark~wrapMatchGroups2Dict} dict - The dictionary
  * @param {array} match - The current match
  * @param {RegExp} regex - The regular expression to be searched for
  * @param {Mark~wrapMatchGroups2FilterCallback} filterCb - Filter
  * callback
  * @param {Mark~wrapMatchGroups2EachCallback} eachCb - Each callback
  */
  wrapMatchGroups2(dict, match, regex, filterCb, eachCb) {
    let matchStart = true,
      startIndex = 0,
      i = 1,
      group, start, end;

    const s = match.index,
      text = dict.value.substring(s, regex.lastIndex);

    for (; i < match.length; i++) {
      group = match[i];
      if (group) {
        // this approach only reliable with contiguous groups
        // unwanted group(s) can be easily filtered out
        start = text.indexOf(group, startIndex);
        end = start + group.length;

        if (start !== -1) {
          this.wrapRangeInMappedTextNode(dict, s + start, s + end, (node) => {
            return filterCb(group, node, i);
          }, (node, groupStart) => {
            eachCb(node, matchStart, groupStart, i);
            matchStart = false;
          });
          startIndex = end;
        }
      }
    }
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
   * @param {number} ignoreGroups - A number indicating the amount of RegExp
   * matching groups to ignore
   * @param {Mark~wrapMatchesFilterCallback} filterCb
   * @param {Mark~wrapMatchesEachCallback} eachCb
   * @param {Mark~wrapMatchesEndCallback} endCb
   * @access protected
   */
  wrapMatches(regex, ignoreGroups, filterCb, eachCb, endCb) {
    const matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
    this.getTextNodes(dict => {
      dict.nodes.forEach(node => {
        node = node.node;
        let match;
        while (
          (match = regex.exec(node.textContent)) !== null &&
          match[matchIdx] !== ''
        ) {
          if (this.opt.separateGroups && match.length !== 1){
            node = this.separateGroups(
              node,
              match,
              matchIdx,
              filterCb,
              eachCb
            );
          } else {
            if (!filterCb(match[matchIdx], node)) {
              continue;
            }
            let pos = match.index;
            if (matchIdx !== 0) {
              for (let i = 1; i < matchIdx; i++) {
                pos += match[i].length;
              }
            }
            node = this.wrapGroups(node, pos, match[matchIdx].length, eachCb);
          }
          // reset index of last match as the node changed and the
          // index isn't valid anymore http://tinyurl.com/htsudjd
          regex.lastIndex = 0;
        }
      });
      endCb();
    });
  }

  /**
   * @typedef Mark~matchInfoObject
   * @type {object}
   * @property {array} match - The result of RegExp exec() method
   * @property {boolean} matchStart - indicate the start of match
   * @property {number} groupIndex - The index of match group,
   * is only available with both 'acrossElements' and 'separateGroups' options
   * @property {boolean} groupStart - indicate the start of group, is only
   * available with both 'acrossElements' and 'separateGroups' options
   */

  /**
   * @typedef Mark~filterInfoObject
   * @type {object}
   * @property {RegExp} regex - The regular expression to be searched for
   * @property {array} match - The result of RegExp exec() method
   * @property {boolean} matchStart - indicate the start of match
   * @property {number} groupIndex - The group index, is only available
   * with both 'acrossElements' and 'separateGroups' options
   */

  /**
   * Callback for each wrapped element
   * @callback Mark~wrapMatchesAcrossElementsEachCallback
   * @param {HTMLElement} element - The marked DOM element
   * @param {Mark~matchInfoObject} matchInfo - The object containing match
   * information
   */
  /**
   * Filter callback before each wrapping
   * @callback Mark~wrapMatchesAcrossElementsFilterCallback
   * @param {string} match - The matching string
   * @param {HTMLElement} node - The text node where the match occurs
   * @param {Mark~filterInfoObject} filterInfo - The object containing match
   * information
   */

  /**
   * Callback on end
   * @callback Mark~wrapMatchesAcrossElementsEndCallback
   */
  /**
   * Wraps the instance element and class around matches across all HTML
   * elements in all contexts
   * @param {RegExp} regex - The regular expression to be searched for
   * @param {number} ignoreGroups - A number indicating the amount of RegExp
   * matching groups to ignore
   * @param {Mark~wrapMatchesAcrossElementsFilterCallback} filterCb
   * @param {Mark~wrapMatchesAcrossElementsEachCallback} eachCb
   * @param {Mark~wrapMatchesAcrossElementsEndCallback} endCb
   * @access protected
   */
  wrapMatchesAcrossElements(regex, ignoreGroups, filterCb, eachCb, endCb) {
    // check for separateGroups is necessary in case of accidental use
    // of ignoreGroups option with separateGroups
    const matchIdx =
      ignoreGroups === 0 || this.opt.separateGroups ? 0 : ignoreGroups + 1;
    let match, count;

    this.getTextNodesAcrossElements(dict => {
      while (
        (match = regex.exec(dict.value)) !== null &&
        match[matchIdx] !== ''
      ) {
        count = -1;

        if (this.opt.separateGroups) {
          let fn = regex.hasIndices ? 'wrapMatchGroups' : 'wrapMatchGroups2';

          this[fn](dict, match, regex, (group, node, groupIndex) => {
            return filterCb(group, node, {
              match : match,
              matchStart : ++count === 0,
              groupIndex : groupIndex,
            });
          }, (node, matchStart, groupStart, groupIndex) => {
            eachCb(node, {
              match : match,
              matchStart : matchStart,
              groupIndex : groupIndex,
              groupStart : groupStart,
            });
          });

        } else {
          // calculate range inside dict.value
          let start = match.index;
          if (matchIdx !== 0) {
            for (let i = 1; i < matchIdx; i++) {
              start += match[i].length;
            }
          }
          const end = start + match[matchIdx].length;

          this.wrapRangeInMappedTextNode(dict, start, end, node => {
            return filterCb(match[matchIdx], node, {
              regex: regex,
              match : match,
              matchStart : ++count === 0,
            });
          }, (node, matchStart) => {
            eachCb(node, {
              match : match,
              matchStart : matchStart,
            });
          });
        }
      }
      endCb();
    });
  }

  /**
   * Callback for each wrapped element
   * @callback Mark~wrapRangeFromIndexEachCallback
   * @param {HTMLElement} element - The marked DOM element
   * @param {Mark~rangeObject} range - the current range object; provided
   * start and length values will be numeric integers modified from the
   * provided original ranges.
   */
  /**
   * Filter callback before each wrapping
   * @callback Mark~wrapRangeFromIndexFilterCallback
   * @param {HTMLElement} node - The text node which includes the range
   * @param {Mark~rangeObject} range - the current range object
   * @param {string} match - string extracted from the matching range
   * @param {number} counter - A counter indicating the number of all marks
   */

  /**
   * Callback on end
   * @callback Mark~wrapRangeFromIndexEndCallback
   */
  /**
   * Wraps the indicated ranges across all HTML elements in all contexts
   * @param {Mark~setOfRanges} ranges
   * @param {Mark~wrapRangeFromIndexFilterCallback} filterCb
   * @param {Mark~wrapRangeFromIndexEachCallback} eachCb
   * @param {Mark~wrapRangeFromIndexEndCallback} endCb
   * @access protected
   */
  wrapRangeFromIndex(ranges, filterCb, eachCb, endCb) {
    this.getTextNodes(dict => {
      const originalLength = dict.value.length;
      ranges.forEach((range, counter) => {
        let {start, end, valid} = this.checkWhitespaceRanges(
          range,
          originalLength,
          dict.value
        );
        if (valid) {
          this.wrapRangeInMappedTextNode(dict, start, end, node => {
            return filterCb(
              node,
              range,
              dict.value.substring(start, end),
              counter
            );
          }, node => {
            eachCb(node, range);
          });
        }
      });
      endCb();
    });
  }

  /**
   * Unwraps the specified DOM node with its content (text nodes or HTML)
   * without destroying possibly present events (using innerHTML) and normalizes
   * the parent at the end (merge splitted text nodes)
   * @param  {HTMLElement} node - The DOM node to unwrap
   * @access protected
   */
  unwrapMatches(node) {
    const parent = node.parentNode;
    let docFrag = document.createDocumentFragment();
    while (node.firstChild) {
      docFrag.appendChild(node.removeChild(node.firstChild));
    }
    parent.replaceChild(docFrag, node);
    if (!this.ie) { // use browser's normalize method
      parent.normalize();
    } else { // custom method (needs more time)
      this.normalizeTextNode(parent);
    }
  }

  /**
   * Normalizes text nodes. It's a workaround for the native normalize method
   * that has a bug in IE (see attached link). Should only be used in IE
   * browsers as it's slower than the native method.
   * @see {@link http://tinyurl.com/z5asa8c}
   * @param {HTMLElement} node - The DOM node to normalize
   * @access protected
   */
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

  /**
   * Callback for each marked element
   * @callback Mark~markEachCallback
   * @param {HTMLElement} element - The marked DOM element
   * @param {Mark~filterInfoObject} filterInfo - The object containing match
   * information, is only available with 'acrossElements' option
   */
  /**
   * Callback if there were no matches
   * @callback Mark~markNoMatchCallback
   * @param {RegExp} term - The search term that was not found
   */
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
   * @property {string[]} [exclude] - An array with exclusion selectors.
   * Elements matching those selectors will be ignored
   * @property {boolean} [iframes=false] - Whether to search inside iframes
   * @property {number} [iframesTimeout=5000] - Maximum ms to wait for a load
   * event of an iframe
   * @property {boolean} [acrossElements=false] - Whether to find matches
   * across HTML elements. By default, only matches within single HTML
   * elements will be found
   * @property {Mark~markEachCallback} [each]
   * @property {Mark~markNoMatchCallback} [noMatch]
   * @property {Mark~commonDoneCallback} [done]
   * @property {boolean} [debug=false] - Whether to log messages
   * @property {object} [log=window.console] - Where to log messages (only if
   * debug is true)
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
   * @param {string} match - The matching string:
   * 1) without 'ignoreGroups' and 'separateGroups' options - the whole match.
   * 2) with 'ignoreGroups' - [ignoreGroups number + 1] group matching string.
   * 3) with both 'acrossElements' and 'separateGroups' options - the current
   * group matching string
   * @param {number} counter - A counter indicating the number of all marks
   * @param {Mark~filterInfoObject} filterInfo - The object containing match
   * information, is only available with 'acrossElements' option
   */

  /**
   * Callback for each marked element
   * @callback Mark~markRegExpEachCallback
   * @param {HTMLElement} element - The marked DOM element
   * @param {Mark~matchInfoObject} matchInfo - The object containing match
   * information, is only available with 'acrossElements' option
   */

  /**
   * These options also include the common options from
   * {@link Mark~commonOptions}
   * @typedef Mark~markRegExpOptions
   * @type {object.<string>}
   * @property {number} [ignoreGroups=0] - A number indicating the amount of
   * RegExp matching groups to ignore
   * @property {boolean} [separateGroups] - Whether to mark each regular
   * expression group as a separate match
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

    let totalMatches = 0,
      fn = 'wrapMatches';
    const eachCb = (element, matchInfo) => {
      totalMatches++;
      this.opt.each(element, matchInfo);
    };
    if (this.opt.acrossElements) {
      fn = 'wrapMatchesAcrossElements';
      // this solve backward-compatibility but open gate for new code
      // to slip in without g flag
      if ( !regexp.global && !regexp.sticky) {
        let splits = regexp.toString().split('/'),
          flags = 'g' + splits[splits.length-1];

        regexp = new RegExp(regexp.source, flags);
        this.log(
          'RegExp is recompiled with g flag because it must have g flag'
        );
      }
    }
    this.log(`Searching with expression "${regexp}"`);

    this[fn](regexp, this.opt.ignoreGroups, (match, node, filterInfo) => {
      return this.opt.filter(node, match, totalMatches, filterInfo);
    }, eachCb, () => {
      if (totalMatches === 0) {
        this.opt.noMatch(regexp);
      }
      this.opt.done(totalMatches);
    });
  }

  /**
   * Callback to filter matches
   * @callback Mark~markFilterCallback
   * @param {HTMLElement} textNode - The text node which includes the match
   * @param {string} match - The matching term
   * @param {number} totalCounter - A counter indicating the number of all
   * marks
   * @param {number} termCounter - A counter indicating the number of marks
   * for the specific match
   * @param {Mark~filterInfoObject} filterInfo - The object containing match
   * information, is only available with 'acrossElements' option
   */

  /**
   * These options also include the common options from
   * {@link Mark~commonOptions} and the options from
   * {@link RegExpCreator~options}
   * @typedef Mark~markOptions
   * @type {object.<string>}
   * @property {boolean} [separateWordSearch=true] - Whether to search for
   * each word separated by a blank instead of the complete term
   * @property {Mark~markFilterCallback} [filter]
   */
  /**
   * Marks the specified search terms
   * @param {string|string[]} [sv] - Search value, either a search string or an
   * array containing multiple search strings
   * @param  {Mark~markOptions} [opt] - Optional options object
   * @access public
   */
  mark(sv, opt) {
    this.opt = opt;
    let totalMatches = 0,
      fn = 'wrapMatches';
    const {
        keywords: kwArr,
        length: kwArrLen
      } = this.getSeparatedKeywords(typeof sv === 'string' ? [sv] : sv),
      handler = kw => { // async function calls as iframes are async too
        const regex = new RegExpCreator(this.opt).create(kw);
        let matches = 0;
        this.log(`Searching with expression "${regex}"`);
        this[fn](regex, 1, (term, node, filterInfo) => {
          return this.opt.filter(node, kw, totalMatches, matches, filterInfo);
        }, (element, matchInfo) => {
          matches++;
          totalMatches++;
          this.opt.each(element, matchInfo);
        }, () => {
          if (matches === 0) {
            this.opt.noMatch(kw);
          }
          if (kwArr[kwArrLen - 1] === kw) {
            this.opt.done(totalMatches);
          } else {
            handler(kwArr[kwArr.indexOf(kw) + 1]);
          }
        });
      };
    if (this.opt.acrossElements) {
      fn = 'wrapMatchesAcrossElements';
    }
    if (kwArrLen === 0) {
      this.opt.done(totalMatches);
    } else {
      handler(kwArr[0]);
    }
  }

  /**
   * Callback for each marked element
   * @callback Mark~markRangesEachCallback
   * @param {HTMLElement} element - The marked DOM element
   * @param {array} range - array of range start and end points
   */
  /**
   * Callback if a processed range is invalid, out-of-bounds, overlaps another
   * range, or only matches whitespace
   * @callback Mark~markRangesNoMatchCallback
   * @param {Mark~rangeObject} range - a range object
   */
  /**
   * Callback to filter matches
   * @callback Mark~markRangesFilterCallback
   * @param {HTMLElement} node - The text node which includes the range
   * @param {array} range - array of range start and end points
   * @param {string} match - string extracted from the matching range
   * @param {number} counter - A counter indicating the number of all marks
   */

  /**
   * These options also include the common options from
   * {@link Mark~commonOptions} without the each and noMatch callback
   * @typedef Mark~markRangesOptions
   * @type {object.<string>}
   * @property {Mark~markRangesEachCallback} [each]
   * @property {Mark~markRangesNoMatchCallback} [noMatch]
   * @property {Mark~markRangesFilterCallback} [filter]
   */
  /**
   * Marks an array of objects containing a start with an end or length of the
   * string to mark
   * @param  {Mark~setOfRanges} rawRanges - The original (preprocessed)
   * array of objects
   * @param  {Mark~markRangesOptions} [opt] - Optional options object
   * @access public
   */
  markRanges(rawRanges, opt) {
    this.opt = opt;
    let totalMatches = 0,
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
          totalMatches++;
          this.opt.each(element, range);
        }, () => {
          this.opt.done(totalMatches);
        }
      );
    } else {
      this.opt.done(totalMatches);
    }
  }

  /**
   * Removes all marked elements inside the context with their HTML and
   * normalizes the parent at the end
   * @param  {Mark~commonOptions} [opt] - Optional options object without each,
   * noMatch and acrossElements properties
   * @access public
   */
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

export default Mark;
