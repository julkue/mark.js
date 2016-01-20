```
   _           _   _ _       _     _ _       _     _   
  (_)_ __ ___ | | | (_) __ _| |__ | (_) __ _| |__ | |_ 
  | | '_ ` _ \| |_| | |/ _` | '_ \| | |/ _` | '_ \| __|
  | | | | | | |  _  | | (_| | | | | | | (_| | | | | |_ 
 _/ |_| |_| |_|_| |_|_|\__, |_| |_|_|_|\__, |_| |_|\__|
|__/                   |___/           |___/           
```

#### JavaScript keyword highlighting. Can be used e.g. to highlight search results on page.

[![Dependency Status](https://www.versioneye.com/user/projects/55893384306662001e0000e8/badge.svg?style=flat)](https://www.versioneye.com/user/projects/55893384306662001e0000e8)
[![Build Status](https://travis-ci.org/julmot/jmHighlight.svg?branch=master)](https://travis-ci.org/julmot/jmHighlight)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/27a3ed45370f41e89b02073b214c18a7)](https://www.codacy.com/app/julmot/jmHighlight)
[![Percentage of issues still open](http://isitmaintained.com/badge/open/julmot/jmHighlight.svg)](http://isitmaintained.com/project/julmot/jmHighlight "Percentage of issues still open")
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/julmot/jmHighlight/master/LICENSE)

##1. Getting started

Choose between:
- Run `$ bower install jmHighlight --save-dev`
- Download "[jquery.jmHighlight.min.js](https://github.com/julmot/jmHighlight/blob/master/dist/jquery.jmHighlight.min.js)" inside the "dist" folder and include it in your project (Note: the file must be saved as UTF-8)

You are ready to start!

*Note: The plugin requires jQuery! If you are not using RequireJS, NodeJS oder CommonJS you should make sure that jQuery was embedded.*

##2. Highlight usage

To highlight a keyword/phrase you can define an element that will be wrapped around the
keyword. The default element is `span`. Also you can define a class that will be appended
to the wrapper. The default class is `highlight`. 

If you want to ignore some elements in the context, e.g. a specific element with a class you need to
pass an array `filter` in the option-object. The filter-array should contain all selectors that should be ignored.

Also you can highlight a sentence/phrase instead of a single word. You can use `separateWordSearch`
to define if the keyword search should be separately (separeted with a blank) or together.

If you are searching for keywords in a language with diacritics, you can
use the `diacritics` option. Then for example "justo" would also match "justò".

Last but not least you have the option to define `synonyms`. With this you can match
aliases like "two" and "2".

```javascript
// Will highlight each keyword "lorem" in the context ".test"
// It will ignore all keywords inside ".noHighlight" and ".ignore".
// The wrapper element will be a "em"-element with the class "customHighlight"
$(".test").jmHighlight("lorem", {
     // Optional
    "filter": [
        ".noHighlight",
        ".ignore"
    ],
    // Optional. Default is "span"
    "element": "em",
    // Optional. Default is "highlight"
    "className": "customHighlight",
    // Optional: If your search keyword is more than one word
    // separeted with a blank, you can define this property with true
    // if you want a separeted search for the keywords. If you define
    // nothing the default value is false, so it will be searched
    // for the complete term
    "separateWordSearch": true,
    // if diacritics should be matched too
    "diacritics": true, // default true
    // match e.g. "1" and also "one".
    // This can also be used to match dissolved umlauts like ä and ae
    "synonyms": {
        "one": "1",
        "ä": "ae"
    },
    // set "debug" to true if you want to see console logs
    "debug": true,
    // set a custom log object if "debug" is true
    "log": window.console
});
```

**Options overview**

|       Option       | Type    | Default     | Description                                                                                   |
|:------------------:|---------|-------------|-----------------------------------------------------------------------------------------------|
|       element      | string  | "span"      | HTML element to wrap matched elements, e.g. `span`                                            |
|      className     | string  | "highlight" | A class name that will be appended to the element                                             |
|       filter       | array   | []          | An array with exclusion selectors where the plugin should not check for matching elements     |
| separateWordSearch | boolean | false       | If the plugin should search for each word (separated by a blank) instead of the complete term |
|     diacritics     | boolean | true        | If diacritic characters should be matched. For example "justo" would also match "justò"       |
| synonyms           | object  | {}          | An object with synonyms. The plugin will search for the key or the value and highlight both   |
|        debug       | boolean | false       | Set this option to true if you want to see console logs                                       |
|         log        | object  | console     | Log messages to a specific object (only if  `debug` is true)                                  |

_Note: Do not use "html" as the context, choose at least "body"!_

##3. Highlight removal usage

You can remove the highlight in a specific context by
 - a specific class (in our example above "customHighlight")
 - a specific element
 - a keyword
 
You can combine them like below. Everything inside the option-object is optionally, also the keyword itself.

```javascript
$(".test").jmRemoveHighlight({
    "filter": [
        ".noHighlight",
        ".ignore"
    ],
    "element": "span",
    "className": "customHighlight"
}, "lorem");
```

**Options overview**

|   Option  | Type    | Default     | Description                                                  |
|:---------:|---------|-------------|--------------------------------------------------------------|
|  element  | string  | "span"      | HTML element to wrap matched elements, e.g. `span`           |
| className | string  | "highlight" | A class name that will be appended to the element            |
|   debug   | boolean | false       | Set this option to true if you want to see console logs      |
|    log    | object  | console     | Log messages to a specific object (only if  `debug` is true) |

##4. Usage examples
 - [Default usage example](https://jsfiddle.net/julmot/vpav6tL1/)
 - [Table column highlighting example](https://jsfiddle.net/julmot/1at87fnu/)
 - [DataTables highlighting example](https://jsfiddle.net/julmot/buh9h2r8/)

##5. Browser compatibility

The plugin works in all modern browsers.
It has been tested in Firefox, Chrome, Safari, Edge and IE9+.

![IE9-11](https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png)
![IE10-11](https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer-tile/internet-explorer-tile_48x48.png)
![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_48x48.png)
![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_48x48.png)
![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_48x48.png)


##6. Contributing

The project is using Grunt as a base, Karma as a task runner
and Jasmine as testing framework.
Before you start contributing, you should clone or download this repository and run:

```bash
bower install
npm install
```

Now you are ready to develop. Developer API:

| Grunt task | Description                                                                                                                      |
|------------|----------------------------------------------------------------------------------------------------------------------------------|
| dev        | Will create a server that you can open in your prefered browser. It will track file changes and re-run the test in your browser. |
| dist       | Will run a test and generate the .min.js file inside the "dist" folder                                                           |
| minify     | Will just generate the .min.js file inside "dist"                                                                                |
| test       | Will just run the test                                                                                                           |

Note: Run the tasks with `$ grunt [task]` (Replace "[task]" with the actual task).

If you're feeling ambitious, you can submit a pull request – how thoughtful
of you!
Also if you experiencing troubles with the plugin, please open an [issue](https://github.com/julmot/jmHighlight/issues/new).

Happy hacking!
