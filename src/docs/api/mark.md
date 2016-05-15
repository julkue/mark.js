---
title: mark()
---

**JavaScript Syntax**:

```javascript
var context = document.querySelector(".context");
var instance = new Mark(context);
instance.mark(keyword [, options]);
```

**jQuery Syntax**:

```javascript
$(".context").mark(keyword [, options]);
```

**Parameters**:

_keyword_

Type: `string` or `array` of `string`

The keyword to be marked. Can also be an array with multiple keywords. Note that
keywords will be escaped. If you need to mark unescaped keywords (e.g.
containing a pattern), have a look at the `markRegExp()` method below.

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
| noMatch   | function |         | A callback function for not found terms. Will receive the not found term as a parameter.                                                                                                                                                                                                                       |
| complete  | function |         | _Deprecated: Use "done" instead_. A callback function after all marks are completed                                                                                                                                                                                                                            |
| done      | function |         | A callback function after all marks are done                                                                                                                                                                                                                                                                   |
| debug     | boolean  | false   | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                          |
| log       | object   | console | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                   |


[diacritic]: https://en.wikipedia.org/wiki/Diacritic
[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
