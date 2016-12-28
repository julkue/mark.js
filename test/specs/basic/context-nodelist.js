/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark called with a NodeList context", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/context-nodelist.html");

        $ctx = $(".basic-context-nodelist");
        var ctxNodelist = document.querySelectorAll(".basic-context-nodelist");
        new Mark(ctxNodelist).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "done": done
        });
    });

    it("should wrap matches", function () {
        expect($ctx.find("mark")).toHaveLength(8);
    });
});
