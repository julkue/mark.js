# jquery.mark (previously jmHighlight)

#### jQuery keyword highlighting. Highlight text with JavaScript. <br> Can e.g. be used to mark text in search results.

[![Dependency Status][dependency-status-image]][dependency-status]
[![Build Status][build-status-image]][build-status]
[![Code quality][code-quality-image]][code-quality]
[![Bower Version][bower-version-image]][bower-version]
[![License][license-image]][license]

## 1. Getting started

Choose between:
- Run `$ bower install jquery.mark --save-dev` (assuming you have pre-installed
  [Node.js][nodejs] and [Bower][bower])
- Download "[dist/jquery.mark.min.js][minified]" and include it in your project.
  Make sure that the file is saved as UTF-8

You are ready to start!

*Note: jquery.mark is a jQuery plugin compatible with RequireJS, NodeJS/CommonJS
or without any module loader! Anyhow you are using it, make sure that jQuery
is embedded.*

## 2. API

### 2.1 mark()

Syntax:

```javascript
$(".context").mark(keyword [, options]);
```

Parameters:

##### keyword

Type: `string` or `array` of `string`

The keyword to be marked. Can also be an array with multiple keywords. Note that they will be escaped.

##### options

Type: `object`

Optional options:

| Option             | Type     | Default      | Description                                                                                                                                                                                                                                                                                                               |
|--------------------|----------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element            | string   | "span"       | HTML element to wrap matches, e.g. `span`                                                                                                                                                                                                                                                                                 |
| className          | string   | "mark"       | A class name that will be appended to <code>element</code>                                                                                                                                                                                                                                                                |
| filter             | array    | [ ]          | An array with exclusion selectors. Elements matching those selectors will be ignored. Example: `"filter": [".ignore", "*[data-ignore]"]`                                                                                                                                                                                  |
| separateWordSearch | boolean  | false        | If the plugin should search for each word (separated by a blank) instead of the complete term                                                                                                                                                                                                                             |
| diacritics         | boolean  | true         | If [diacritic][diacritic] characters should be matched. For example "piękny" would also match "piekny" and "doner" would also match "döner"                                                                                                                                                                               |
| synonyms           | object   | { }          | An object with synonyms. The key will be a synonym for the value and the value for the key. Example: `"synonyms": {"one": "1"}` will add the synonym "1" for "one" and vice versa                                                                                                                                         |
| wordBoundary       | boolean  | false        | Whether to mark only matches with a word boundary                                                                                                                                                                                                                                                                         |
| iframes            | boolean  | false        | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass a <code>filter</code> selector that matches these iframes. |
| each               | function | function(){} | A callback for each marked element. This function receives the marked jQuery element as a parameter                                                                                                                                                                                                                       |
| complete           | function | function(){} | As jquery.mark is asynchronous this callback function is called after all marks are completed                                                                                                                                                                                                                             |
| debug              | boolean  | false        | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                     |
| log                | object   | console      | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                              |

### 2.2 markRegExp()

Syntax:

```javascript
$(".context").markRegExp(regexp [, options]);
```

Parameters:

##### regexp

Type: `RegExp`

The regular expression to be marked. Example: `/Lor[^]?m/gmi`.

##### options

Type: `object`

Optional options:

| Option    | Type     | Default      | Description                                                                                                                                                                                                                                                                                                               |
|-----------|----------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element   | string   | "span"       | HTML element to wrap matches, e.g. `span`                                                                                                                                                                                                                                                                                 |
| className | string   | "mark"       | A class name that will be appended to <code>element</code>                                                                                                                                                                                                                                                                |
| filter    | array    | [ ]          | An array with exclusion selectors. Elements matching those selectors will be ignored. Example: `"filter": [".ignore", "*[data-ignore]"]`                                                                                                                                                                                  |
| iframes   | boolean  | false        | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass a <code>filter</code> selector that matches these iframes. |
| each      | function | function(){} | A callback for each marked element. This function receives the marked jQuery element as a parameter                                                                                                                                                                                                                       |
| complete  | function | function(){} | As jquery.mark is asynchronous this callback function is called after all marks are completed                                                                                                                                                                                                                             |
| debug     | boolean  | false        | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                     |
| log       | object   | console      | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                              |

### 2.3 removeMark()

Syntax:
```javascript
$(".context").removeMark(options);
```

Parameters:

##### options

Type: `object`

Optional options:

| Option    | Type     | Default      | Description                                                                                                                                                                                                                                                                                                                         |
|-----------|----------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element   | string   | "*"          | Removal element, e.g. `span`                                                                                                                                                                                                                                                                                                        |
| className | string   | "*"          | Removal class name, e.g. `mark`                                                                                                                                                                                                                                                                                                     |
| filter    | array    | [ ]          | An array with exclusion selectors. Elements matching those selectors will be ignored. Example: `"filter": [".ignore", "*[data-ignore]"]`                                                                                                                                                                                            |
| iframes   | boolean  | false        | Whether to remove marks also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to remove marks inside specific iframes (e.g. facebook share), you can pass a <code>filter</code> selector that matches these iframe |
| complete  | function | function(){} | As jquery.mark is asynchronous this callback function is called after all marks are removed                                                                                                                                                                                                                                         |
| debug     | boolean  | false        | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                               |
| log       | object   | console      | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                                        |

## 3. Usage examples
 - [Default example][jsfiddle-default]
 - [Mark example with regular expression][jsfiddle-regex]
 - [Table column example][jsfiddle-table-column]
 - [DataTables example with global search][jsfiddle-datatables-global]
 - [DataTables example with column search][jsfiddle-datatables-column]
 - [URL Referrer mark example][jsfiddle-referrer]

## 4. Browser compatibility

The plugin works in all modern browsers.
It has been tested in Firefox, Chrome, Opera, Safari, Edge and IE9+.

![Firefox][firefox-icon]
![Chrome][chrome-icon]
![Opera][opera-icon]
![Safari][safari-icon]
![Edge][edge-icon]
![IE9-11][ie-icon]
![IE10-11][ie-tile-icon]  
[![Sauce Labs Test Status][sauce-matrix-image]][sauce-matrix]

## 5. Contributing

See [the contribution guidelines][contribution-guidelines].

## 6. Changelog

Changes are documented in [release descriptions][releases].

---

Happy hacking!

[dependency-status]: https://www.versioneye.com/user/projects/55893384306662001e0000e8
[build-status]: https://travis-ci.org/julmot/jquery.mark
[code-quality]: https://www.codacy.com/app/julmot/jquery.mark
[bower-version]: https://github.com/julmot/jquery.mark
[license]: https://raw.githubusercontent.com/julmot/jquery.mark/master/LICENSE

[dependency-status-image]:https://img.shields.io/versioneye/d/javascript/julmot:jquery.mark.svg
[build-status-image]: https://img.shields.io/travis/julmot/jquery.mark/master.svg
[code-quality-image]:https://img.shields.io/codacy/27a3ed45370f41e89b02073b214c18a7.svg
[bower-version-image]:https://img.shields.io/bower/v/jquery.mark.svg
[license-image]:https://img.shields.io/badge/license-MIT-blue.svg

[nodejs]: https://nodejs.org/en/
[bower]: http://bower.io/
[diacritic]: https://en.wikipedia.org/wiki/Diacritic
[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy

[contribution-guidelines]: https://github.com/julmot/jquery.mark/blob/master/CONTRIBUTING.md
[minified]: https://github.com/julmot/jquery.mark/blob/master/dist/jquery.mark.min.js
[releases]: https://github.com/julmot/jquery.mark/releases

[jsfiddle-default]: https://jsfiddle.net/julmot/vpav6tL1/ "Default mark example"
[jsfiddle-regex]: https://jsfiddle.net/julmot/ova17daa/ "Mark example with regular expression"
[jsfiddle-table-column]: https://jsfiddle.net/julmot/1at87fnu/ "Table column highlighting"
[jsfiddle-datatables-global]: https://jsfiddle.net/julmot/buh9h2r8/ "DataTables global mark"
[jsfiddle-datatables-column]: https://jsfiddle.net/julmot/c2am6zfr/ "DataTables column highlighting"
[jsfiddle-referrer]: https://jsfiddle.net/julmot/bL6bb5oo/ "URL Referrer highlighting"

[firefox-icon]: https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_48x48.png
[chrome-icon]: https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_48x48.png
[opera-icon]: https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera_48x48.png
[safari-icon]: https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_48x48.png
[edge-icon]: https://raw.githubusercontent.com/alrra/browser-logos/master/edge/edge_48x48.png
[ie-icon]: https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png
[ie-tile-icon]: https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer-tile/internet-explorer-tile_48x48.png
[sauce-matrix]: https://saucelabs.com/u/jquery-mark
[sauce-matrix-image]: https://saucelabs.com/browser-matrix/jquery-mark.svg
