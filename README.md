jmHighlight
==============

###### JavaScript: Highlight keywords/phrases in a context with a defined class. Can be used e.g. to highlight search results on page.

Usage
--------
To highlight a keyword/phrase you can define a element that will be wrapped around the
keyword. The default element is `span`. Also you can define a class that will be appended
to the wrapper. The default class is `highlight`. 

If you want to ignore some elements in the context, e.g. a specific element with a class you need to
pass a object "filter" in the option-object. The filter-object should contain an array
of all selectors, that should be ignored.

You can also highlight multiple keywords/phrases in the context. Just clone this code below.
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
    "className": "customHighlight"
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


_License: The MIT License (MIT)_