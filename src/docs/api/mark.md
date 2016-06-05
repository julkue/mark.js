---
title: mark()
---

A method to highlight custom search terms.

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

| Option             | Type     | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------|----------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element            | string   | "mark"      | HTML element to wrap matches, e.g. `span`                                                                                                                                                                                                                                                                                                                                                                                                       |
| className          | string   | ""          | A class name that will be appended to `element`                                                                                                                                                                                                                                                                                                                                                                                                 |
| filter             | array    | [ ]         | An array with exclusion selectors. Matches inside these elements will be ignored. Example: `"filter": ["h1", ".ignore"]`                                                                                                                                                                                                                                                                                                                        |
| separateWordSearch | boolean  | true        | Whether to search for each word separated by a blank instead of the complete term                                                                                                                                                                                                                                                                                                                                                               |
| accuracy           | string   | "partially" | Either one of the following values:<ul><li>"partially": When searching for "lor" only "lor" inside "lorem" will be marked</li><li>"complementary": When searching for "lor" the whole word "lorem" will be marked</li><li>"exactly": When searching for "lor" only those exact words with a word boundary will be marked. In this example nothing inside "lorem". This value is equivalent to the previous option <i>wordBoundary</i></li></ul> |
| diacritics         | boolean  | true        | If [diacritic][diacritic] characters should be matched. For example "piękny" would also match "piekny" and "doner" would also match "döner"                                                                                                                                                                                                                                                                                                     |
| synonyms           | object   | { }         | An object with synonyms. The key will be a synonym for the value and the value for the key. Example: `"synonyms": {"one": "1"}` will add the synonym "1" for "one" and vice versa                                                                                                                                                                                                                                                               |
| iframes            | boolean  | false       | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass a `filter` selector that matches these iframes.                                                                                                                                  |
| each               | function |             | A callback for each marked element. Receives the marked DOM element as a parameter                                                                                                                                                                                                                                                                                                                                                              |
| noMatch            | function |             | A callback function that will be called when there are no matches. Receives the not found term as a parameter                                                                                                                                                                                                                                                                                                                                   |
| complete           | function |             | _Deprecated: Use "done" instead_. A callback function after all marks are completed. Receives the number of total marked elements as a parameter                                                                                                                                                                                                                                                                                                |
| done               | function |             | A callback function after all marks are done. Receives the number of total marked elements as a parameter                                                                                                                                                                                                                                                                                                                                       |
| debug              | boolean  | false       | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                                                                                                                                           |
| log                | object   | console     | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                                                                                                                                                    |

[diacritic]: https://en.wikipedia.org/wiki/Diacritic
[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
