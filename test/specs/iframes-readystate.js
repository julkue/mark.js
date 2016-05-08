/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("mark with iframes where onload was already fired", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-readystate.html");

        $elements = $();
        $ctx = $(".iframes-readystate");
        errCall = 0;
        var int = setInterval(function () {
            var iCon = $ctx.find("iframe").first()[0].contentWindow;
            var readyState = iCon.document.readyState;
            var href = iCon.location.href;
            // about:blank check is necessary for Chrome (see Mark~onIframeReady)
            if(readyState === "complete" && href !== "about:blank") {
                clearInterval(int);
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
            }
        }, 100);
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
        expect($elements).toHaveLength(8);
        expect(errCall).toBe(0);
    });
});
