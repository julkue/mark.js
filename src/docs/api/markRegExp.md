---
title: markRegExp()
---

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

The regular expression to be marked. Example: `/Lor[^]?m/gmi`.

_options_

Type: `object`

Optional options:

| Option             | Type     | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------|----------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element            | string   | "mark"      | HTML element to wrap matches, e.g. `span`                                                                                                                                                                                                                                                                                                                                                                                                       |
| className          | string   | ""          | A class name that will be appended to `element`                                                                                                                                                                                                                                                                                                                                                                                                 |
| filter             | array    | [ ]         | An array with exclusion selectors. Elements matching those selectors will be ignored. Example: `"filter": [".ignore", "*[data-ignore]"]`                                                                                                                                                                                                                                                                                                        |
| iframes            | boolean  | false       | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass a `filter` selector that matches these iframes.                                                                                                                                  |
| each               | function |             | A callback for each marked element. This function receives the marked DOM element as a parameter                                                                                                                                                                                                                                                                                                                                                |
| complete           | function |             | A callback function after all marks are completed                                                                                                                                                                                                                                                                                                                                                                                               |
| debug              | boolean  | false       | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                                                                                                                                           |
| log                | object   | console     | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                                                                                                                                                    |

[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
