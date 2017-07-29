/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with diacritics for Vietnamese", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/diacritics-vietnamese.html");

        $ctx = $(".basic-diacritics-vietnamese");
        // including a term with a "s" and a whitespace to check "merge blanks"
        // behavior in combination with diacritics
        new Mark($ctx[0]).mark(["truong", "am", "ac"], {
            "separateWordSearch": false,
            "done": done
        });
    });

    it("should treat normal and diacritic characters equally", function () {
        expect($ctx.find("mark")).toHaveLength(9);
    });
});
