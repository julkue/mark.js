---
title: Styling
---

{{defaults.title}} will wrap matches with a specified element and optionally
with an assigned class. When not changing the default element `mark`, browsers
will ensure that it looks highlighted by default. However, you may want to
customize the style of it. This can be done using e.g. the following CSS:

```css
mark{
    background: orange;
    color: black;
}
```

If you've customized the default element or class, make sure to modify the
selector.
