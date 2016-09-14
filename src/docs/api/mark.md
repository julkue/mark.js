---
title: mark()
---

A method to highlight custom search terms.

#### Syntax

JavaScript:

```javascript
var context = document.querySelector(".context");
var instance = new Mark(context);
instance.mark(keyword [, options]);
```

jQuery:

```javascript
$(".context").mark(keyword [, options]);
```

__Note__: This is a chaining method, thus allows you to call further methods on
the returning object.

#### Parameters

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
| iframes            | boolean          | false       | Whether to search also inside iframes. If you don't have permissions to some iframes (e.g. because they have a [different origin][SOP]) they will be silently skipped. If you don't want to search inside specific iframes (e.g. facebook share), you can pass an `exclude` selector that matches these iframes                                                                                                                                                                                                                                                                                                                                                                                                     |
| acrossElements     | boolean          | false       | Whether to search for matches across elements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| caseSensitive      | boolean          | false       | Whether to search case sensitive                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ignoreJoiners      | boolean          | false       | Whether to also find matches that contain soft hyphen, zero width space, zero width non-joiner and zero width joiner. They're used to indicate a point for a line break where there isn't enough space to show the full word                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| each               | function         |             | A callback for each marked element. Receives the marked DOM element as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| filter             | function         |             | A callback to filter or limit matches. It will be called for each match and receives the following parameters: <ol><li>The text node which includes the match</li><li>The term that has been found</li><li>A counter indicating the total number of all marks at the time of the function call</li><li>A counter indicating the number of marks for the term</li></ol> The function must return false if the mark should be stopped, otherwise true                                                                                                                                                                                                                                                                 |
| noMatch            | function         |             | A callback function that will be called when there are no matches. Receives the not found term as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| done               | function         |             | A callback function after all marks are done. Receives the total number of marks as a parameter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| debug              | boolean          | false       | Set this option to `true` if you want to log messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| log                | object           | console     | Log messages to a specific object (only if  `debug` is true)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

#### Examples

{{> collapsible
id="mark-code-overview-basic"
triggerContent="Basic example"
content='JavaScript:

<pre><code class="lang-javascript">var context = document.querySelector(".context"); // requires an element with class "context" to exist
var instance = new Mark(context);
instance.mark("test"); // will mark the keyword "test"
</code></pre>

jQuery:

<pre><code class="lang-javascript">$(".context").mark("test"); // will mark the keyword "test", requires an element with class "context" to exist</code></pre>
'}}

{{> collapsible
id="mark-code-overview-options"
triggerContent="Example with all above named options and their default values"
content='For both, JavaScript and jQuery:

<pre><code class="lang-javascript">var options = {
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
    "ignoreJoiners": false,
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
};
</code></pre>

JavaScript:

<pre><code class="lang-javascript">var context = document.querySelector(".context"); // requires an element with class "context" to exist
var instance = new Mark(context);
instance.mark("test", options); // will mark the keyword "test"
</code></pre>

jQuery:

<pre><code class="lang-javascript">$(".context").mark("test", options); // will mark the keyword "test", requires an element with class "context" to exist</code></pre>
'}}

[diacritic]: https://en.wikipedia.org/wiki/Diacritic
[SOP]: https://en.wikipedia.org/wiki/Same-origin_policy
