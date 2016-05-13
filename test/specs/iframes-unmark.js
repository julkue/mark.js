/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("unmark with iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes.html");

        $ctx = $(".iframes");
        $elements = $();
        errCall = 0;
        var instance = new Mark($ctx[0]);
        instance.mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "iframes": true,
            "each": function ($el) {
                $elements = $elements.add($($el));
            },
            "done": function () {
                instance.unmark({
                    "iframes": true,
                    "done": function () {
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should remove all marked elements inside iframes", function () {
        $elements.each(function () {
            expect(this).not.toBeInDOM();
        });
        expect(errCall).toBe(0);
    });
});
