/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with diacritics", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-diacritics.html");

        $ctx = $(".basic-diacritics");
        new Mark($ctx[0]).mark(["dolor", "amet", "justo"], {
            "separateWordSearch": false,
            "done": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should treat normal and diacritic characters equally", function () {
        expect($ctx.find("mark")).toHaveLength(13);
    });
});
