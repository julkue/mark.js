/**
 * Creates regular expressions based on specified settings
 * @example
 * new RegExpCreator({caseSensitive: true, diacritics: false}).create('lorem');
 * // => /()(lorem)/gm
 */
class RegExpCreator {

  /**
   * @typedef RegExpCreator~accuracyObj
   * @type {object.<string>}
   * @property {string} value - An accuracy string value
   * @property {string[]} limiters - A custom array of limiters. For example
   * <code>["-", ","]</code>
   */
  /**
   * @typedef RegExpCreator~accuracy
   * @type {string}
   * @property {"partially"|"complementary"|"exactly"|RegExpCreator~accuracyObj}
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
   */
  /**
   * @typedef RegExpCreator~wildcards
   * @type {string}
   * @property {"disabled"|"enabled"|"withSpaces"}
   * [wildcards="disabled"] - Set to any of the following string values:
   * <ul>
   *   <li><i>disabled</i>: Disable wildcard usage</li>
   *   <li><i>enabled</i>: When searching for "lor?m", the "?" will match zero
   *   or one non-space character (e.g. "lorm", "loram", "lor3m", etc). When
   *   searching for "lor*m", the "*" will match zero or more non-space
   *   characters (e.g. "lorm", "loram", "lor123m", etc).</li>
   *   <li><i>withSpaces</i>: When searching for "lor?m", the "?" will
   *   match zero or one space or non-space character (e.g. "lor m", "loram",
   *   etc). When searching for "lor*m", the "*" will match zero or more space
   *   or non-space characters (e.g. "lorm", "lore et dolor ipsum", "lor: m",
   *   etc).</li>
   * </ul>
   */
  /**
   * @typedef RegExpCreator~ignorePunctuation
   * @type {string[]}
   * @property {string} The strings in this setting will contain punctuation
   * marks that will be ignored:
   * <ul>
   *   <li>These punctuation marks can be between any characters, e.g. setting
   *   this option to <code>["'"]</code> would match "Worlds", "World's" and
   *   "Wo'rlds"</li>
   *   <li>One or more apostrophes between the letters would still produce a
   *   match (e.g. "W'o''r'l'd's").</li>
   *   <li>A typical setting for this option could be as follows:
   *   <pre>ignorePunctuation: ":;.,-–—‒_(){}[]!'\"+=".split(""),</pre> This
   *   setting includes common punctuation as well as a minus, en-dash,
   *   em-dash and figure-dash
   *   ({@link https://en.wikipedia.org/wiki/Dash#Figure_dash ref}), as well
   *   as an underscore.</li>
   * </ul>
   */

  /**
   * @typedef RegExpCreator~options
   * @type {object.<string>}
   * @property {boolean} [diacritics=true] - If diacritic characters should be
   * matched. ({@link https://en.wikipedia.org/wiki/Diacritic Diacritics})
   * @property {object.<string|string[]>} [synonyms] - An object with synonyms.
   * The key will be a synonym for the value and the value for the key
   * @property {RegExpCreator~accuracy} [accuracy]
   * @property {boolean} [caseSensitive=false] - Whether to search case
   * sensitive
   * @property {boolean} [ignoreJoiners=false] - Whether to ignore word
   * joiners inside of key words. These include soft-hyphens, zero-width
   * space, zero-width non-joiners and zero-width joiners.
   * @property {RegExpCreator~ignorePunctuation} [ignorePunctuation]
   * @property {RegExpCreator~wildcards} [wildcards]
   */
  /**
   * @param {RegExpCreator~options} [options] - Optional options object
   */
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

  /**
   * Creates a regular expression to match the specified search term considering
   * the available option settings
   * @param  {string} str - The search term to be used
   * @return {RegExp}
   */
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

  /**
   * Sort array from longest entry to shortest
   * @param {array} arry - The array to sort
   * @return {array}
   */
  sortByLength(arry) {
    return arry.sort((a, b) => a.length === b.length ?
      // sort a-z for same length elements
      (a > b ? 1 : -1) :
      b.length - a.length
    );
  }

  /**
   * Escapes a string for usage within a regular expression
   * @param {string} str - The string to escape
   * @return {string}
   */
  escapeStr(str) {
    // eslint-disable-next-line no-useless-escape
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  /**
   * Creates a regular expression string to match the defined synonyms
   * @param  {string} str - The search term to be used
   * @return {string}
   */
  createSynonymsRegExp(str) {
    const syn = this.opt.synonyms,
      sens = this.opt.caseSensitive ? '' : 'i',
      // add replacement character placeholder before and after the
      // synonym group
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

  /**
   * Setup synonyms to work with ignoreJoiners and or ignorePunctuation
   * @param {string} str - synonym key or value to process
   * @return {string} - processed synonym string
   */
  processSynonyms(str) {
    if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
      str = this.setupIgnoreJoinersRegExp(str);
    }
    return str;
  }

  /**
   * Sets up the regular expression string to allow later insertion of wildcard
   * regular expression matches
   * @param  {string} str - The search term to be used
   * @return {string}
   */
  setupWildcardsRegExp(str) {
    // replace single character wildcard with unicode 0001
    str = str.replace(/(?:\\)*\?/g, val => {
      return val.charAt(0) === '\\' ? '?' : '\u0001';
    });
    // replace multiple character wildcard with unicode 0002
    return str.replace(/(?:\\)*\*/g, val => {
      return val.charAt(0) === '\\' ? '*' : '\u0002';
    });
  }

  /**
   * Sets up the regular expression string to allow later insertion of wildcard
   * regular expression matches
   * @param  {string} str - The search term to be used
   * @return {string}
   */
  createWildcardsRegExp(str) {
    // default to "enable" (i.e. to not include spaces)
    // "withSpaces" uses `[\\S\\s]` instead of `.` because the latter
    // does not match new line characters
    let spaces = this.opt.wildcards === 'withSpaces';
    return str
    // replace unicode 0001 with a RegExp class to match any single
    // character, or any single non-whitespace character depending
    // on the setting
      .replace(/\u0001/g, spaces ? '[\\S\\s]?' : '\\S?')
      // replace unicode 0002 with a RegExp class to match zero or
      // more characters, or zero or more non-whitespace characters
      // depending on the setting
      .replace(/\u0002/g, spaces ? '[\\S\\s]*?' : '\\S*');
  }

  /**
   * Sets up the regular expression string to allow later insertion of
   * designated characters (soft hyphens & zero width characters)
   * @param  {string} str - The search term to be used
   * @return {string}
   */
  setupIgnoreJoinersRegExp(str) {
    // adding a "null" unicode character as it will not be modified by the
    // other "create" regular expression functions
    return str.replace(/[^(|)\\]/g, (val, indx, original) => {
      // don't add a null after an opening "(", around a "|" or before
      // a closing "(", or between an escapement (e.g. \+)
      let nextChar = original.charAt(indx + 1);
      if (/[(|)\\]/.test(nextChar) || nextChar === '') {
        return val;
      } else {
        return val + '\u0000';
      }
    });
  }

  /**
   * Creates a regular expression string to allow ignoring of designated
   * characters (soft hyphens, zero width characters & punctuation) based on the
   * specified option values of <code>ignorePunctuation</code> and
   * <code>ignoreJoiners</code>
   * @param  {string} str - The search term to be used
   * @return {string}
   */
  createJoinersRegExp(str) {
    let joiner = [];
    const ignorePunctuation = this.opt.ignorePunctuation;
    if (Array.isArray(ignorePunctuation) && ignorePunctuation.length) {
      joiner.push(this.escapeStr(ignorePunctuation.join('')));
    }
    if (this.opt.ignoreJoiners) {
      // u+00ad = soft hyphen
      // u+200b = zero-width space
      // u+200c = zero-width non-joiner
      // u+200d = zero-width joiner
      joiner.push('\\u00ad\\u200b\\u200c\\u200d');
    }
    return joiner.length ?
      str.split(/\u0000+/).join(`[${joiner.join('')}]*`) :
      str;
  }

  /**
   * Creates a regular expression string to match diacritics
   * @param  {string} str - The search term to be used
   * @return {string}
   */
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
        // Check if the character is inside a diacritics list
        if (dct.indexOf(ch) !== -1) {
          // Check if the related diacritics list was not
          // handled yet
          if (handled.indexOf(dct) > -1) {
            return false;
          }
          // Make sure that the character OR any other
          // character in the diacritics list will be matched
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

  /**
   * Creates a regular expression string that merges whitespaces characters
   * including subsequent ones into a single pattern, one or multiple
   * whitespaces
   * @param  {string} str - The search term to be used
   * @return {string}
   */
  createMergedBlanksRegExp(str) {
    return str.replace(/[\s]+/gmi, '[\\s]+');
  }

  /**
   * Creates a regular expression string to match the specified string with the
   * defined accuracy. As in the regular expression of "exactly" can be a group
   * containing a blank at the beginning, all regular expressions will be
   * created with two groups. The first group can be ignored (may contain
   * the said blank), the second contains the actual match
   * @param  {string} str - The searm term to be used
   * @return {string}
   */
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

export default RegExpCreator;
