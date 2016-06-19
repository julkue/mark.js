---
title: Filter
---

The callback option `filter` can be used to filter highlights yourself. For
example you could use it to limit highlights for specific words or generally to
a specific amount. Or you could check if the match is inside a complex HTML
construct which can not be expressed in a exclusion selector. Just be creative!

Here is an example to limit matches for a word "the" to a maximum of 10:

```javascript
var options = {
    "filter": function(node, term, counter, totalCounter){
        if(term === "the" && counter >= 10){
            return false;
        } else {
            return true;
        }
    }
};
```
