/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with diacritics", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/diacritics.html");

        $ctx = $(".basic-diacritics");
        // including a term with a "s" and a whitespace to check "merge blanks"
        // behavior in combination with diacritics
        new Mark($ctx[0]).mark(["dolor", "amet", "justo", "lores ipsum"], {
            "separateWordSearch": false,
            "done": function () {
                done();
            }
        });
    });

    it("should treat normal and diacritic characters equally", function () {
        expect($ctx.find("mark")).toHaveLength(14);
    });
});
