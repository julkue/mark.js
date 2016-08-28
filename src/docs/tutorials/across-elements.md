---
title: Across Elements
---

In some cases you need to highlight matches even if they occur in multiple
elements. Let's say the following is the context where you'd like to highlight
the search term "Highlight Text":

```html
<div class="context">
    <b>Highlight</b>
    Text
</div>
```

Then "Highlight" and "Text" are only highlighted when you haven't disabled
`separateWordSearch`, as this will cause a separated search for words.  
If you have disabled `separateWordSearch` nothing will be highlighted. This
appears due to the fact that the two words included in the search term aren't
located within the same text node. As you can see above "Highlight" is wrapped
in a separate `<b>` element.  
To make sure matches will be found across multiple elements – in this example
across `<b>` – you'll have to enable the `acrossElements` option with the value
`true`.

This option `acrossElements` will find matches even if the matching search term
is located across multiple HTML elements or even iframes (if enabled).
