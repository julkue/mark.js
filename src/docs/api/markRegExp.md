---
title: markRegExp()
---

A method to highlight custom [regular expressions][regexp].

**JavaScript Syntax**:

```javascript
var context = document.querySelector(".context");
var instance = new Mark(context);
instance.markRegExp(regexp [, options]);
```

**jQuery Syntax**:

```javascript
$(".context").markRegExp(regexp [, options]);
```

Note that this is a chaining method, thus allows you to call further methods on
the returning object.

**Parameters**:

_regexp_

Type: `RegExp`

The regular expression to be marked. Example: `/Lor[^]?m/gmi`. Note that groups
will be ignored.

_options_

Type: `object`

Optional options:

| Option             | Type     | Default | Description                                                                                                                                                                                                                                                                                                                 |
|--------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element            | string   | "mark"  | HTML element to wrap matches, e.g. `span`                                                                                                                                                                                                                                                                                   |
| className          | string   | ""      | A class name that will be appended to `element`                                                                                                                                                                                                                                                                             |
| exclude            | array    | [ ]     | An array with exclusion selectors. Matches inside these elements will be ignored. Example: `"filter": ["h1", ".ignore"]`                                                                                                                                                                                                    |
| iframes            | boolean  | false   | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass an `exclude` selector that matches these iframes.            |
| acrossElements     | boolean  | false   | Whether to search for matches across elements                                                                                                                                                                                                                                                                               |
| each               | function |         | A callback for each marked element. Receives the marked DOM element as a parameter                                                                                                                                                                                                                                          |
| filter             | function |         | A callback to filter or limit matches. It will receive the following parameters: <ol><li>The text node which includes the match</li><li>The matching string that has been found</li><li>A counter indicating the number of all marks</li></ol> The function must return false if the mark should be stopped, otherwise true |
| noMatch            | function |         | A callback function that will be called when there are no matches. Receives the not found term as a parameter                                                                                                                                                                                                               |
| done               | function |         | A callback function after all marks are done. Receives the total number of marks as a parameter                                                                                                                                                                                                                             |
| debug              | boolean  | false   | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                       |
| log                | object   | console | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                                |

{{> collapsible
id="markregexp-code-overview"
triggerContent="Click here to see a code overview of all above named options"
content='<pre><code class="lang-javascript">{
    "element": "mark",
    "className": "",
    "exclude": [],
    "iframes": false,
    "acrossElements": false,
    "each": function(node){
        // node is the marked DOM element
    },
    "filter": function(textNode, foundTerm, totalCounter){
        // textNode is the text node which contains the found term
        // foundTerm is the found search term
        // totalCounter is a counter indicating the total number of all marks
        //              at the time of the function call
        return true; // must return either true or false
    },
    "noMatch": function(term){
        // term is the not found term
    },
    "done": function(counter){
        // counter is a counter indicating the total number of all marks
    },
    "debug": false,
    "log": window.console
}
</code></pre>
'}}

[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
[regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
