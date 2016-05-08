/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("mark in inaccessible iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-inaccessible.html");

        $elements = $();
        $ctx = $(".iframes-inaccessible");
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

    it("should silently skip iframes which can not be accessed", function () {
        expect($elements).toHaveLength(4);
        expect(errCall).toBe(0);
    });
});
