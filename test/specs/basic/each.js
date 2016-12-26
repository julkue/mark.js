/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with each callback", function () {
    var $ctx, eachCalled;
    beforeEach(function (done) {
        loadFixtures("basic/main.html");

        eachCalled = 0;
        $ctx = $(".basic");
        new Mark($ctx[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "each": function () {
                eachCalled++;
            },
            "done": function () {
                done();
            }
        });
    });

    it("should call the each callback for each marked element", function () {
        expect(eachCalled).toBe(4);
    });
});
