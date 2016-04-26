/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
((factory, window, document) => {
    if(typeof define === "function" && define.amd) {
        define(["jquery"], jQuery => {
            return factory(window, document, jQuery);
        });
    } else if(typeof exports === "object") {
        factory(window, document, require("jquery"));
    } else {
        factory(window, document, jQuery);
    }
})((window, document, $) => {
    //<%= module %>
    $.fn.mark = function (sv, opt) {
        new Mark(this).mark(sv, opt);
        return this;
    };
    $.fn.markRegExp = function (regexp, opt) {
        new Mark(this).markRegExp(regexp, opt);
        return this;
    };
    $.fn.unmark = function (opt) {
        new Mark(this).unmark(opt);
        return this;
    };
}, window, document);
