---
title: Filter
---

When having a context that contains multiple elements and you need to ignore
matches in some of them, the option `filter` may be worth gold. You can pass
an array of filter selectors that will be excluded from highlighting.

Assuming you have the following DOM fragment:

```html
<div class="context">
    <article>
        <header>
            <h1>Article Text Headline</h1>
            <div class="byline">
                <address class="author">
                    By <a rel="author" href="demo/link">John Doe</a>
                </address>
                on
                <time pubdate datetime="2016-30-05" title="May 30th, 2016">5/30/16</time>
            </div>
        </header>
        <div class="article-content">
            Article text content
        </div>
    </article>
</div>
```

And you want to highlight all "text" matches, but only in the actual article
content. Then you can either initialize {{defaults.title}} directly on
the `div` containing the article's content (in this case `div.article-content`),
or specify a filter matching the elements that should be ignored, e.g. as
follows:

```javascript
var instance = new Mark(document.querySelector("div.context"));
instance.mark("text", {
    "filter": [
        "h1",
        ".byline"
    ]
});
```

This would exclude matches inside `<h1>` elements and those having a class
`byline` assigned.
