---
title: markRanges()
---

A method to mark ranges with a start position and length. They will be applied
to text nodes in the specified context.

#### Syntax

JavaScript:

```javascript
var context = document.querySelector(".context");
var instance = new Mark(context);
instance.markRanges(ranges [, options]);
```

jQuery:

```javascript
$(".context").markRanges(ranges [, options]);
```

__Note__: Even if this is a chaining method and therefore allows you to call
further methods on the returning object, it's recommended to always use the
`done` callback as {{defaults.title}} works asynchronous.

#### Parameters

_ranges_

Type: `array`

An array of objects with a `start` and `length` property. Note that the start
positions must be specified including whitespace characters.

_options_

Type: `object`

Optional options:

| Option             | Type             | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|--------------------|------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element            | string           | "mark"      | HTML element to wrap matches, e.g. `span`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| className          | string           | ""          | A class name that will be appended to `element`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| exclude            | array            | [ ]         | An array with exclusion selectors. Matches inside these elements will be ignored. Example: `"filter": ["h1", ".ignore"]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| iframes            | boolean          | false       | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass an `exclude` selector that matches these iframes                                                                                                                                                                                                                                                                                                                                                                                                     |
| iframesTimeout     | number           | 5000        | The maximum ms to wait for a `load` event before skipping an iframe. Especially important when there's no internet connection or a browser "offline" mode is enabled and an iframe has an online `src` – then the `load` event is never fired                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| each               | function         |             | A callback for each marked element. Receives the marked DOM element and the corresponding range as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| filter             | function         |             | A callback to filter or limit matches. It will be called for each match and receives the following parameters: <ol><li>The text node which includes the range</li><li>The current range</li><li>The extracted term from the matching range</li><li>A counter indicating the total number of all marks at the time of the function call</li></ol> The function must return false if the mark should be stopped, otherwise true                                                                                                                                                                                                                                                                                       |
| noMatch            | function         |             | A callback function that will be called when there are no matches. Receives the not found range as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| done               | function         |             | A callback function after all marks are done. Receives the total number of marks as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| debug              | boolean          | false       | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| log                | object           | console     | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

#### Examples

{{> collapsible
id="markranges-code-overview-basic"
triggerContent="Basic example"
content='JavaScript:

<pre><code class="lang-javascript">var context = document.querySelector(".context"); // requires an element with class "context" to exist
var instance = new Mark(context);
instance.markRanges([{
    start: 15,
    length: 5
}, {
    start: 25:
    length: 8
}]); // marks matches with ranges 15-20 and 25-33
</code></pre>

jQuery:

<pre><code class="lang-javascript">$(".context").markRanges([{
    start: 15,
    length: 5
}, {
    start: 25:
    length: 8
}]); // marks matches with ranges 15-20 and 25-33
</code></pre>
'}}

{{> collapsible
id="markranges-code-overview-options"
triggerContent="Example with all above named options and their default values"
content='For both, JavaScript and jQuery:

<pre><code class="lang-javascript">var options = {
    "element": "mark",
    "className": "",
    "exclude": [],
    "iframes": false,
    "iframesTimeout": 5000,
    "each": function(node, range){
        // node is the marked DOM element
        // range is the corresponding range
    },
    "filter": function(textNode, range, term, counter){
        // textNode is the text node which contains the found term
        // range is the found range
        // term is the extracted term from the matching range
        // counter is a counter indicating the number of marks for the found term
        return true; // must return either true or false
    },
    "noMatch": function(range){
        // the not found range
    },
    "done": function(counter){
        // counter is a counter indicating the total number of all marks
    },
    "debug": false,
    "log": window.console
};
</code></pre>

JavaScript:

<pre><code class="lang-javascript">var context = document.querySelector(".context"); // requires an element with class "context" to exist
var instance = new Mark(context);
instance.markRanges([{
    start: 15,
    length: 5
}, {
    start: 25:
    length: 8
}], options);
</code></pre>

jQuery:

<pre><code class="lang-javascript">$(".context").markRanges([{
    start: 15,
    length: 5
}, {
    start: 25:
    length: 8
}], options);
</code></pre>
'}}