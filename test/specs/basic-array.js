/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark called with a context array", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-array.html");

        $ctx = $(".basic-array");
        new Mark($ctx.get()).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "done": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("mark")).toHaveLength(8);
    });
});
