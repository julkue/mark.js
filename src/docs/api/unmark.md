---
title: unmark()
---

A method to remove highlights created by {{defaults.title}}.

#### Syntax

JavaScript:

```javascript
var context = document.querySelector(".context");
var instance = new Mark(context);
instance.unmark(options);
```

jQuery:

```javascript
$(".context").unmark(options);
```

__Note__: Even if this is a chaining method and therefore allows you to call
further methods on the returning object, it's recommended to always use the
`done` callback as {{defaults.title}} works asynchronous.

#### Parameters

_options_

Type: `object`

Optional options:

| Option    | Type     | Default | Description                                                                                                                                                                                                                                                                                                      |
|-----------|----------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element   | string   | ""      | Will remove only marked elements with this specific element                                                                                                                                                                                                                                                      |
| className | string   | ""      | Will remove only marked elements with this specific class name                                                                                                                                                                                                                                                   |
| exclude   | array    | [ ]     | An array with exclusion selectors. These elements will be ignored. Example: `"filter": ["h1", ".ignore"]`                                                                                                                                                                                                        |
| iframes   | boolean  | false   | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass an `exclude` selector that matches these iframes  |
| done      | function |         | A callback function after all marked elements were removed                                                                                                                                                                                                                                                       |
| debug     | boolean  | false   | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                            |
| log       | object   | console | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                     |

{{> collapsible
id="unmark-code-overview-basic"
triggerContent="Basic example"
content='JavaScript:

<pre><code class="lang-javascript">var context = document.querySelector(".context"); // requires an element with class "context" to exist
var instance = new Mark(context);
instance.unmark();
</code></pre>

jQuery:

<pre><code class="lang-javascript">$(".context").unmark(); // requires an element with class "context" to exist</code></pre>
'}}

{{> collapsible
id="unmark-code-overview-options"
triggerContent="Example with all above named options and their default values"
content='For both, JavaScript and jQuery:

<pre><code class="lang-javascript">var options = {
    "element": "",
    "className": "",
    "exclude": [],
    "iframes": false,
    "done": function(){},
    "debug": false,
    "log": window.console
};
</code></pre>

JavaScript:

<pre><code class="lang-javascript">var context = document.querySelector(".context"); // requires an element with class "context" to exist
var instance = new Mark(context);
instance.unmark(options);
</code></pre>

jQuery:

<pre><code class="lang-javascript">$(".context").unmark(options); // requires an element with class "context" to exist</code></pre>
'}}

[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
