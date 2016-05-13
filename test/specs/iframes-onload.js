/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("mark with iframes where onload was not fired yet", function () {
    // Note that in Chrome the onload event will already be fired. Reason
    // is that Chrome initializes every iframe with an empty page, which will
    // fire the onload event too respectively set readyState complete
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-onload.html");

        $elements = $();
        $ctx = $(".iframes-onload");
        errCall = 0;
        new Mark($ctx[0]).mark("test", {
            "diacritics": false,
            "separateWordSearch": false,
            "iframes": true,
            "each": function ($m) {
                $elements = $elements.add($($m));
            },
            "done": function () {
                done();
            }
        });
    }, 30000); // 30 sec timeout
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches inside iframes", function () {
        var unequal = false;
        $elements.each(function () {
            if($(this).prop("ownerDocument") != $ctx.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(true);
        expect($elements).toHaveLength(2);
        expect(errCall).toBe(0);
    });
});
