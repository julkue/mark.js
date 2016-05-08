/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with array", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-array-keyword.html");

        $ctx = $(".basic-array-keyword");
        new Mark($ctx[0]).mark(["lorem", "ipsum"], {
            "diacritics": false,
            "separateWordSearch": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap all matching keywords from the array", function () {
        expect($ctx.find("mark")).toHaveLength(8);
    });
});
