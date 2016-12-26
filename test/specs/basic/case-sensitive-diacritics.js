/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with caseSenstive and diacritics", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/case-sensitive-diacritics.html");

        $ctx = $(".basic-case-sensitive-diacritics");
        new Mark($ctx.get()).mark(["Dolor", "Amet", "Aliquam", "Lorem ipsum"], {
            "separateWordSearch": false,
            "caseSensitive": true,
            "done": done
        });
    });

    it("should find case sensitive matches with diacritics", function () {
        expect($ctx.find("mark")).toHaveLength(8);
    });
});
