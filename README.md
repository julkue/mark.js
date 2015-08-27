jmHighlight
==============

###### JavaScript: Highlight keywords/phrases in a context with a defined class. Can be used e.g. to highlight search results on page.

[![Dependency Status](https://www.versioneye.com/user/projects/55893384306662001e0000e8/badge.svg?style=flat)](https://www.versioneye.com/user/projects/55893384306662001e0000e8)

Usage
--------
To highlight a keyword/phrase you can define an element that will be wrapped around the
keyword. The default element is `span`. Also you can define a class that will be appended
to the wrapper. The default class is `highlight`. 

If you want to ignore some elements in the context, e.g. a specific element with a class you need to
pass a array "filter" in the option-object. The filter-array should contain all selectors, that should be ignored.

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
    // set "debug" to true if you want to see console logs
    "debug": true
});
```
You can remove the highlight in a specific context by
 * a specific class (in our example above "customHighlight")
 * a specific element
 * or a keyword
 
You can combine them as the code below shows. If you don't
pass any constraint all highlights will be removed.

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

Demo
--------
See /test folder.

Contributing
------------
If you would like to implement new features or fix some [issues](http://github.com/julmot/jmHighlight/issues) 
then just clone this repository and run `bower install`.
If you're feeling ambitious, you can submit a pull request - how thoughtful
of you!

Happy hacking!