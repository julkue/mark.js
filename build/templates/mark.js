/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
((factory, window, document) => {
    if(typeof define === "function" && define.amd) {
        define([], () => {
            return factory(window, document);
        });
    } else if(typeof module === "object" && module.exports) {
        module.exports = factory(window, document);
    } else {
        factory(window, document);
    }
})((window, document) => {
    //<%= module %>
    //Expose public API as long as JS doesn't support public/private methods
    window.Mark = function (ctx) {
        const instance = new Mark(ctx);
        this.mark = (sv, opt) => {
            instance.mark(sv, opt);
            return this;
        };
        this.markRegExp = (sv, opt) => {
            instance.markRegExp(sv, opt);
            return this;
        };
        this.unmark = (opt) => {
            instance.unmark(opt);
            return this;
        };
        return this;
    };
    //Return for AMD (can then be used as parameter in AMD)
    return window.Mark;
}, window, document);
