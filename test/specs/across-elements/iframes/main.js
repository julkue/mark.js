/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with acrossElements and iframes", function () {
    var $ctx, $elements, errCall;
    beforeEach(function (done) {
        loadFixtures("across-elements/iframes/main.html");

        $elements = $();
        $ctx = $(".across-elements-iframes");
        errCall = 0;
        try {
            new Mark($ctx[0]).mark("lorem", {
                "diacritics": false,
                "separateWordSearch": false,
                "iframes": true,
                "acrossElements": true,
                "each": function ($m) {
                    $elements = $elements.add($($m));
                },
                "done": done
            });
        } catch(e) {
            errCall++;
        }
    }, 30000); // 30 sec timeout

    it("should wrap matches inside iframes", function () {
        expect(errCall).toBe(0);
        expect($elements).toHaveLength(8);
        var unequal = false;
        $elements.each(function () {
            // make sure that some elements are inside an iframe
            if($(this).prop("ownerDocument") !== $ctx.prop("ownerDocument")) {
                unequal = true;
            }
        });
        expect(unequal).toBe(true);
    });
});
