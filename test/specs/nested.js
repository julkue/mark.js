/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("nested mark", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("nested.html");

        $ctx = $(".nested");
        new Mark($ctx[0]).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "className": "mark",
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("mark.mark")).toHaveLength(7);
    });
    it("should also wrap matches in nested mark elements", function () {
        expect($ctx.find(".nested-mark > mark.mark")).toHaveLength(1);
    });
});
