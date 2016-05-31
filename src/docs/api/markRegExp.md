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

**Parameters**:

_regexp_

Type: `RegExp`

The regular expression to be marked. Example: `/Lor[^]?m/gmi`. Note that groups
will be ignored.

_options_

Type: `object`

Optional options:

| Option    | Type     | Default | Description                                                                                                                                                                                                                                                                                                    |
|-----------|----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element   | string   | "mark"  | HTML element to wrap matches, e.g. `span`                                                                                                                                                                                                                                                                      |
| className | string   | ""      | A class name that will be appended to `element`                                                                                                                                                                                                                                                                |
| filter    | array    | [ ]     | An array with exclusion selectors. Matches inside these elements will be ignored. Example: `"filter": [".ignore", "*[data-ignore]"]`                                                                                                                                                                           |
| iframes   | boolean  | false   | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass a `filter` selector that matches these iframes. |
| each      | function |         | A callback for each marked element. This function receives the marked DOM element as a parameter                                                                                                                                                                                                               |
| noMatch   | function |         | A callback function if there were no matches. Will receive the not found regular expression as a parameter                                                                                                                                                                                                     |
| complete  | function |         | _Deprecated: Use "done" instead_. A callback function after all marks are completed                                                                                                                                                                                                                            |
| done      | function |         | A callback function after all marks are done                                                                                                                                                                                                                                                                   |
| debug     | boolean  | false   | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                          |
| log       | object   | console | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                   |

[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
[regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
