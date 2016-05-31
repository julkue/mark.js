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

[word-boundary]: http://grammar.about.com/od/tz/g/Word-Boundary.htm
