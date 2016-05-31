---
title: Element and Class Name
---

You may ask yourself how {{defaults.title}} works generally or how to wrap
matches with a custom element and class name.
Take this simple DOM fragment as an example:

```html
<div class="context">
    <p>My text content</p>
</div>
```

When you're calling {{defaults.title}} on `div.context` – whether by `mark()`
or by `markRegExp()` – it will find matches and wraps them with a defined
element (tag name) and optionally with a class assigned to that element. So
assuming we'd like to highlight "text" with a `span` tag and a class `highlight`
assigned, then this could be done e.g. as follows:

With JavaScript:
```javascript
var instance = new Mark(document.querySelector("div.context"));
instance.mark("text", {
    "element": "span",
    "className": "highlight"
});
```

With jQuery:
```javascript
$("div.context").mark("text", {
    "element": "span",
    "className": "highlight"
});
```

The generated DOM fragment would then look like:

```html
<div class="context">
    <p>My <span class="highlight">text</span> content</p>
</div>
```
