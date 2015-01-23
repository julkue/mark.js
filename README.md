jmHighlight
==============

###### JavaScript: Highlight. The plugin will highlight keywords in a defined element recursive with a defined class.

Usage
--------
```javascript
// With default class name "highlight"
$("yourSelector").jmHighlight("yourKeyword");
// With custom class name
$("yourSelector").jmHighlight("yourKeyword", "yourClass");
// To remove highlighting
$("yourSelector").jmRemoveHighlight("yourOptionalClass");
```

Demo
--------
See /test folder.

TODO
--------
* Add option to ignore a stack of elements on the highlight process


This plugin is a fork from Johann Burkards highlight plugin: http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
It adds the feature to use custom classes and brings support for AMD-modules like RequireJS, but also support for Node/CommonJS.

_License: The MIT License (MIT)_