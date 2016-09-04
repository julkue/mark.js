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

Note that this is a chaining method, thus allows you to call further methods on
the returning object.

**Parameters**:

_keyword_

Type: `string` or `array` of `string`

The keyword to be marked. Can also be an array with multiple keywords. Note that
keywords will be escaped. If you need to mark unescaped keywords (e.g.
containing a pattern), have a look at the `markRegExp()` method below.

_options_

Type: `object`

Optional options:

| Option             | Type             | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|--------------------|------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| element            | string           | "mark"      | HTML element to wrap matches, e.g. `span`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| className          | string           | ""          | A class name that will be appended to `element`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| exclude            | array            | [ ]         | An array with exclusion selectors. Matches inside these elements will be ignored. Example: `"filter": ["h1", ".ignore"]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| separateWordSearch | boolean          | true        | Whether to search for each word separated by a blank instead of the complete term                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| accuracy           | string or object | "partially" | Either one of the following string values:<ul><li>"partially": When searching for "lor" only "lor" inside "lorem" will be marked</li><li>"complementary": When searching for "lor" the whole word "lorem" will be marked</li><li>"exactly": When searching for "lor" only those exact words with a word boundary will be marked. In this example nothing inside "lorem". This value is equivalent to the previous option <i>wordBoundary</i></li></ul>Or an object containing two properties:<ul><li>"value": One of the above named string values</li><li>"limiters": A custom array of string limiters for accuracy "exactly" or "complementary". Read more about this [in the tutorials section](#accuracy)</li> |
| diacritics         | boolean          | true        | If [diacritic][diacritic] characters should be matched. For example "piękny" would also match "piekny" and "doner" would also match "döner"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| synonyms           | object           | { }         | An object with synonyms. The key will be a synonym for the value and the value for the key. Example: `"synonyms": {"one": "1"}` will add the synonym "1" for "one" and vice versa                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| iframes            | boolean          | false       | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass an `exclude` selector that matches these iframes.                                                                                                                                                                                                                                                                                                                                                                                                    |
| acrossElements     | boolean          | false       | Whether to search for matches across elements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| caseSensitive      | boolean          | false       | Whether to search case sensitive                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| each               | function         |             | A callback for each marked element. Receives the marked DOM element as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| filter             | function         |             | A callback to filter or limit matches. It will receive the following parameters: <ol><li>The text node which includes the match</li><li>The term that has been found</li><li>A counter indicating the total number of all marks at the time of the function call</li><li>A counter indicating the number of marks for the term</li></ol> The function must return false if the mark should be stopped, otherwise true                                                                                                                                                                                                                                                                                               |
| noMatch            | function         |             | A callback function that will be called when there are no matches. Receives the not found term as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| done               | function         |             | A callback function after all marks are done. Receives the total number of marks as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| debug              | boolean          | false       | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| log                | object           | console     | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

{{> collapsible
id="mark-code-overview"
triggerContent="Click here to see a code overview of all above named options"
content='<pre><code class="lang-javascript">{
    "element": "mark",
    "className": "",
    "exclude": [],
    "separateWordSearch": true,
    "accuracy": "partially",
    "diacritics": true,
    "synonyms": {},
    "iframes": false,
    "acrossElements": false,
    "caseSensitive": false,
    "each": function(node){
        // node is the marked DOM element
    },
    "filter": function(textNode, foundTerm, totalCounter, counter){
        // textNode is the text node which contains the found term
        // foundTerm is the found search term
        // totalCounter is a counter indicating the total number of all marks
        //              at the time of the function call
        // counter is a counter indicating the number of marks for the found term
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

[diacritic]: https://en.wikipedia.org/wiki/Diacritic
[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
