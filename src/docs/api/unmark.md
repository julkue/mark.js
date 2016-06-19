---
title: unmark()
---

A method to remove highlights created by {{defaults.title}}.

**JavaScript Syntax**:

```javascript
var context = document.querySelector(".context");
var instance = new Mark(context);
instance.unmark(options);
```

**jQuery Syntax**:

```javascript
$(".context").unmark(options);
```

Note that this is a chaining method, thus allows you to call further methods on
the returning object.

**Parameters**:

_options_

Type: `object`

Optional options:

| Option    | Type     | Default | Description                                                                                                                                                                                                                                                                                                    |
|-----------|----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element   | string   | ""      | Will remove only marked elements with this specific element                                                                                                                                                                                                                                                    |
| className | string   | ""      | Will remove only marked elements with this specific class name                                                                                                                                                                                                                                                 |
| exclude   | array    | [ ]     | An array with exclusion selectors. These elements will be ignored. Example: `"filter": ["h1", ".ignore"]`                                                                                                                                                                                                      |
| iframes   | boolean  | false   | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass a `filter` selector that matches these iframes. |
| done      | function |         | A callback function after all marked elements were removed                                                                                                                                                                                                                                                     |
| debug     | boolean  | false   | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                          |
| log       | object   | console | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                   |

[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
