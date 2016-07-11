---
title: Integration
---

{{defaults.title}} ships with a few files – when using Bower they're located in
`./dist/`:

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

After you have chosen the appropriate file, you need to embed it, e.g. as
follows:

```html
<script src="vendor/mark.js/dist/mark.min.js"></script>
```

Alternatively you can load it with AMD ([RequireJS][requirejs]) or CommonJS.

[ecmascript]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction
[requirejs]: http://requirejs.org/
