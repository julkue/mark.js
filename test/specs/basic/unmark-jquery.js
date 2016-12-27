/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic unmark with jquery", function () {
    var $ctx, ret;
    beforeEach(function (done) {
        loadFixtures("basic/main.html");

        $ctx = $(".basic");
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

    it("should remove all marked elements", function () {
        expect($ctx).not.toContainElement("mark");
    });
    it("should return the provided context jquery element", function () {
        expect(ret instanceof $).toBe(true);
        expect(ret).toBeMatchedBy(".basic");
    });
});
