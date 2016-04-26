/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("mark with disabled iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-disabled.html");

        $elements = $();
        $ctx = $(".iframes-disabled");
        errCall = 0;
        new Mark($ctx[0]).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "iframes": false,
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

    it("should ignore matches inside iframes if specified", function () {
        var unequal = false;
        $elements.each(function () {
            if($(this).prop("ownerDocument") != $ctx.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(false);
        expect($elements).toHaveLength(4);
        expect(errCall).toBe(0);
    });
});
