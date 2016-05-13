/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic unmark with jquery", function () {
    var $ctx, ret;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        $ctx = $(".basic > div:first-child");
        $ctx.mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "done": function () {
                ret = $ctx.unmark({
                    "done": function () {
                        // otherwise "ret =" will not be executed
                        setTimeout(function () {
                            done();
                        }, 50);
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should remove all marked elements", function () {
        expect($ctx).not.toContainElement("mark");
    });
    it("should return the provided context jquery element", function () {
        expect(ret instanceof $).toBe(true);
        expect(ret).toBeMatchedBy(".basic > div:first-child");
    });
});
