---
title: Accuracy
---

_Constraint: Only available in the `mark()` method_

As the name suggests, the `accuracy` option allows you to specify the accuracy
of {{defaults.title}}.

To demonstrate this, we're taking the following DOM fragment as a basis for
all examples below:

```html
<div class="context">
    <p>highlight high</p>
</div>
```

By default, the provided search term will be highlighted, regardless if it's a
substring of a word or a own standing one. This option value is called
`partially`. When searching for "high" inside above named DOM fragment, the
following will be generated:

```html
<div class="context">
    <p><mark>high</mark>light <mark>high</mark></p>
</div>
```

However, there might be cases where you want to ignore partial matches and only
highlight matches for entire words with a word boundary (see
[what is a word boundary][word-boundary]). Then the option value `exactly` is
what you're looking for. When searching for "high", only whole words "high" will
be highlighted:

```html
<div class="context">
    <p>highlight <mark>high</mark></p>
</div>
```

Last but not least, the option value `complementary` will complement matches.
When searching for "high" inside above named DOM fragment, the following will
be generated:

```html
<div class="context">
    <p><mark>highlight</mark> <mark>high</mark></p>
</div>
```


The option value `complementary` highlights the search term and all surrounding
characters until a blank or the start/end of the search context occurs. The
option value `exactly` highlights only whole words that match the specified
search term separated by a blank or the start/end of the search context.

But there might be cases where you might want to use accuracy `exactly`, but
highlight also words that are followed by punctuation marks e.g. a `,` or a `.`.
Or when using accuracy `complementary` you might not want to highlight a `,` or
a `.` following a word. In these cases you can pass an array of custom limiters,
e.g. as follows:

```javascript
var options = {
    "accuracy": {
        "value": "exactly",
        "limiters": [",", "."]
    }
};
```

This will highlight words that are preceded and followed by a blank, the
end/start of the search context (default), `.` or `,` (custom).

[word-boundary]: http://grammar.about.com/od/tz/g/Word-Boundary.htm
