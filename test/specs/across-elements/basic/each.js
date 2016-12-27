/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with acrossElements and each callback", function () {
    var $ctx, eachCalled;
    beforeEach(function (done) {
        loadFixtures("across-elements/basic/main.html");

        eachCalled = 0;
        $ctx = $(".across-elements");
        new Mark($ctx[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "acrossElements": true,
            "each": function () {
                eachCalled++;
            },
            "done": done
        });
    });

    it("should call the each callback for each marked element", function () {
        expect(eachCalled).toBe(6);
    });
});
