/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with iframes", function () {
    var $ctx, $elements, errCall;
    beforeEach(function (done) {
        loadFixtures("iframes.html");

        $elements = $();
        $ctx = $(".iframes");
        errCall = 0;
        try {
            new Mark($ctx[0]).mark("lorem", {
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
        } catch(e) {
            errCall++;
        }
    }, 30000); // 30 sec timeout

    it("should wrap matches inside iframes", function () {
        expect(errCall).toBe(0);
        var unequal = false;
        $elements.each(function () {
            if($(this).prop("ownerDocument") != $ctx.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(true);
        expect($elements).toHaveLength(8);
    });
});
