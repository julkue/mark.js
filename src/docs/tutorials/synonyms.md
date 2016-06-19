---
title: Synonyms
---

There might be cases where highlighting synonyms for words is helpful for users.
Take "one" and "1" as an example. When a user searches for "one last todo", he
might expect to highlight also "1 last todo". In German languages, you could also
map [umlauts][umlauts], e.g. "ü" with "ue" or "ö" with "oe".

The following example will add the synonym "1" for "one", "2" for "two" and vice
versa:

```javascript
var options = {
    "synonyms": {
        "one": "1",
        "two": "2"
    }
};
```

[umlauts]: https://en.wikipedia.org/wiki/Germanic_umlaut
