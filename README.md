jmHighlight
==============

###### JavaScript: Highlight keywords/phrases in a context with a defined class. Can be used e.g. to highlight search results on page.

[![Dependency Status](https://www.versioneye.com/user/projects/55893384306662001e0000e8/badge.svg?style=flat)](https://www.versioneye.com/user/projects/55893384306662001e0000e8) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/julmot/jmHighlight/master/LICENSE) [![Percentage of issues still open](http://isitmaintained.com/badge/open/julmot/jmHighlight.svg)](http://isitmaintained.com/project/julmot/jmHighlight "Percentage of issues still open")

Usage
--------
To highlight a keyword/phrase you can define an element that will be wrapped around the
keyword. The default element is `span`. Also you can define a class that will be appended
to the wrapper. The default class is `highlight`. 

If you want to ignore some elements in the context, e.g. a specific element with a class you need to
pass an array "filter" in the option-object. The filter-array should contain all selectors that should be ignored.

You can also highlight multiple keywords/phrases with different classes in the context. Just clone this code below for each keyword.

Also you can highlight a sentence/phrase instead of a single word. You can use `separateWordSearch`
to define if the search for the keywords (separeted with a blank) should
be separately or together.
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
    // set "debug" to true if you want to see console logs
    "debug": true
});
```
You can remove the highlight in a specific context by
 - a specific class (in our example above "customHighlight")
 - a specific element
 - or a keyword
 
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
Options overview
--------

|       Option       	| Type    	| Default     	| Description                                                                                   	|
|:------------------:	|---------	|-------------	|-----------------------------------------------------------------------------------------------	|
| debug              	| boolean 	| false       	| Set this option to true if you want to see console logs                                       	|
| element            	| string  	| "span"      	| A valid HTML element to wrap matched elements with, e.g. a `span`-element                     	|
| className          	| string  	| "highlight" 	| A class name that will be appended to the element                                             	|
| filter             	| array   	| []          	| An array with all selectors where the plugin should not check for matching elements           	|
| separateWordSearch 	| boolean 	| false       	| If the plugin should search for each word (separated by a blank) instead of the complete term 	|
| diacritics         	| boolean 	| true        	| If diacritic characters should be matched. For example "justo" would also match "justò"       	|

Demo
--------
See /test folder.

Browser compatibility
--------
The plugin works in all modern browsers. It has been tested in Firefox, Chrome, Safari and IE9+. The reason why it's not supported in IE8 and lower is not the API (like missing forEach or arr.indexOf). Instead it's because the DOM is different to modern browsers and it would take unnecessary expense to adjust the plugin to add/remove highlights compatible in a dead browser.

![IE9-11](https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) ![IE10-11](https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer-tile/internet-explorer-tile_48x48.png) ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_48x48.png) ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_48x48.png) ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_48x48.png)

Contributing
------------
If you would like to implement new features or fix some [issues](http://github.com/julmot/jmHighlight/issues) 
then just clone this repository and run `bower install`.
If you're feeling ambitious, you can submit a pull request - how thoughtful
of you!

Happy hacking!


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/julmot/jmhighlight/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

