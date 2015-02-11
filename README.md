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
If you want to ignore some elements then filter the elements yourself like
```javascript
$("yourSelector").filter(function(){
	// Make your filter (return false if the
	// element should be removed from stack
	// otherwise true)
}).jmHighlight("yourKeyword");
```

Demo
--------
See /test folder.




This plugin is a fork from Johann Burkards highlight [Plugin](http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html).
It adds the feature to use custom classes and brings support for AMD-modules like RequireJS, but also support for Node/CommonJS.

_License: The MIT License (MIT)_