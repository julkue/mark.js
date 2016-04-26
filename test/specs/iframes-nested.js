/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("mark in nested iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-nested.html");

        $elements = $();
        $ctx = $(".iframes-nested");
        errCall = 0;
        new Mark($ctx[0]).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "iframes": true,
            "each": function ($m) {
                $elements = $elements.add($($m));
            },
            "complete": function () {
                done();
            }
        });
    }, 30000); // 30 sec timeout
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches inside iframes recursively", function () {
        expect($elements).toHaveLength(12);
        expect(errCall).toBe(0);
    });
});
