/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with partially accuracy", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-accuracy-partially.html");

        $ctx = $(".basic-accuracy-partially");
        new Mark($ctx[0]).mark("lorem", {
            "accuracy": "partially",
            "separateWordSearch": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap the right matches", function () {
        expect($ctx.find("mark")).toHaveLength(4);
        $ctx.find("mark").each(function () {
            expect($(this).text()).toBe("Lorem");
        });
    });
});
