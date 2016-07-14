---
title: General
---

**JavaScript**

Each API method below can be called on an instance object. To initialize a new
instance you have to use:

```javascript
var instance = new Mark(context);
```

The variable `context` defines where you want {{defaults.title}} to search for
matches. If you'd like to highlight matches in a div with a class `test` then
you'd have to use:

```javascript
var instance = new Mark(document.querySelector("div.context"));
```

**jQuery**

Each API method below can be called on every jQuery element, e.g.
`$("div.test")`.
