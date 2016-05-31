---
title: Integration
---

mark.js ships with a few files that can be found under `./dist/`:

- Files for usage with pure JavaScript:
  - `mark.js` - Uncompressed ES5
  - `mark.min.js` - Compressed ES5 (__recommended__)
  - `mark.es6.js` - Uncompressed ES6
  - `mark.es6.min.js` - Compressed ES6
- Files for usage as jQuery plugin:
  - `jquery.mark.js` - Uncompressed ES5
  - `jquery.mark.min.js` - Compressed ES5 (__recommended__)
  - `jquery.mark.es6.js` - Uncompressed ES6
  - `jquery.mark.es6.min.js` - Compressed ES6

If you don't know what ES5 or ES6 ([ECMAScript][ecmascript]) is, then simply go
ahead with a ES5 file as it might be in the JavaScript syntax you are using in
your project.

After you have downloaded mark.js and chosen the appropriate file, you need to
embed the file, e.g. as follows:

```html
<script src="vendor/mark.js/dist/mark.min.js"></script>
```

Alternatively you can load it with AMD ([RequireJS][requirejs]) or CommonJS.

[ecmascript]: https://en.wikipedia.org/wiki/ECMAScript/
[requirejs]: http://requirejs.org/
