```
   _           _   _ _       _     _ _       _     _   
  (_)_ __ ___ | | | (_) __ _| |__ | (_) __ _| |__ | |_ 
  | | '_ ` _ \| |_| | |/ _` | '_ \| | |/ _` | '_ \| __|
  | | | | | | |  _  | | (_| | | | | | | (_| | | | | |_ 
 _/ |_| |_| |_|_| |_|_|\__, |_| |_|_|_|\__, |_| |_|\__|
|__/                   |___/           |___/           
```

#### JavaScript keyword highlighting. Can be used e.g. to highlight text in search results.

[![Dependency Status](https://img.shields.io/versioneye/d/javascript/julmot:jmhighlight.svg)](https://www.versioneye.com/user/projects/55893384306662001e0000e8)
[![Build Status](https://img.shields.io/travis/julmot/jmHighlight.svg)](https://travis-ci.org/julmot/jmHighlight)
[![Codacy Badge](https://img.shields.io/codacy/27a3ed45370f41e89b02073b214c18a7.svg)](https://www.codacy.com/app/julmot/jmHighlight)
[![Bower version](https://img.shields.io/bower/v/jmHighlight.svg)](https://github.com/julmot/jmHighlight)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/julmot/jmHighlight/master/LICENSE)

##1. Getting started

Choose between:
- Run `$ bower install jmHighlight --save-dev`
- Download "[dist/jquery.jmHighlight.min.js](https://github.com/julmot/jmHighlight/blob/master/dist/jquery.jmHighlight.min.js)" and include it in your project (Note: the file must be saved as UTF-8)

You are ready to start!

*Note: jmHighlight is a jQuery plugin! Make sure that jQuery is embedded.*

##2. Highlight usage

Syntax:
```javascript
$(".context").jmHighlight(keyword [, options]);
```

Parameters:

_**keyword**_: A JavaScript string containing the keyword

_**options**_: A JavaScript object containing optional settings:

| Option             | Type    | Default     | Description                                                                                                                                                         |
|--------------------|---------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element            | string  | "span"      | HTML element to wrap matches, e.g. `span`                                                                                                                           |
| className          | string  | "highlight" | A class name that will be appended to `element`                                                                                                                     |
| filter             | array   | []          | An array with exclusion selectors. No highlights will be performed within these selectors. Example: `"filter": [".noHighlight", ".ignore"]`                         |
| separateWordSearch | boolean | false       | If the plugin should search for each word (separated by a blank) instead of the complete term                                                                       |
| diacritics         | boolean | true        | If diacritic characters should be matched. For example "justo" would also match "justò"                                                                             |
| synonyms           | object  | {}          | An object with synonyms. The plugin will search for the key or the value and highlight both. Example: `"synonyms": {"one": "1"}` will add the synonym "1" for "one" |
| debug              | boolean | false       | Set this option to true if you want to log messages                                                                                                                 |
| log                | object  | console     | Log messages to a specific object (only if  `debug` is true)                                                                                                        |

_Note: Do not use `$("html")` as the context, choose at least `$("body")`!_

##3. Highlight removal usage

Syntax:
```javascript
$(".context").jmRemoveHighlight(options);
```

Parameters:

_**options**_:
A JavaScript object containing optional settings:

| Option    | Type    | Default | Description                                                                                                                                         |
|-----------|---------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| element   | string  | "*"     | If you want to remove the highlight for a specific element only, define it here, e.g. `span`                                                        |
| className | string  | "*"     | If you want to remove the highlight for elements with a specific class name, define it here, e.g. `highlight`                                       |
| filter    | array   | []      | An array with exclusion selectors. No highlight removals will be performed within these selectors. Example: `"filter": [".noHighlight", ".ignore"]` |
| debug     | boolean | false   | Set this option to true if you want to log messages                                                                                                 |
| log       | object  | console | Log messages to a specific object (only if  `debug` is true)                                                                                        |

##4. Usage examples
 - [Default usage example](https://jsfiddle.net/julmot/vpav6tL1/)
 - [Table column highlighting example](https://jsfiddle.net/julmot/1at87fnu/)
 - [DataTables highlighting example with global search](https://jsfiddle.net/julmot/buh9h2r8/)
 - [DataTables highlighting example with column search](https://jsfiddle.net/julmot/c2am6zfr/)
 - [Referrer keyword highlighting example](https://jsfiddle.net/julmot/bL6bb5oo/)

##5. Browser compatibility

The plugin works in all modern browsers.
It has been tested in Firefox, Chrome, Safari, Edge and IE9+.

![IE9-11](https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png)
![IE10-11](https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer-tile/internet-explorer-tile_48x48.png)
![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_48x48.png)
![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_48x48.png)
![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_48x48.png)


##6. Contributing

See [the contribution guideline](https://github.com/julmot/jmHighlight/blob/master/CONTRIBUTING.md).

Happy hacking!
