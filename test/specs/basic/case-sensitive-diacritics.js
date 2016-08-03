/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("case senstive mark", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/case-sensitive-diacritics.html");

        $ctx = $(".case-sensitive-diacritics");
        new Mark($ctx.get()).mark(["Dolor", "Amet", "Aliquam", "Lorem ipsum"], {
            "separateWordSearch": false,
            "caseSensitive": true,
            "done": function () {
                done();
            }
        });
    });

    it("should find case sensitive matches with diacritics", function () {
        expect($ctx.find("mark")).toHaveLength(8);
    });
});
