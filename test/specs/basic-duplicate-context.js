/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with duplicate context elements", function () {
    var $ctx1, called;
    beforeEach(function (done) {
        loadFixtures("basic-duplicate-context.html");

        $ctx1 = $(".basic-duplicate-context");
        called = 0;
        new Mark([$ctx1[0], $ctx1[0]]).mark("test", {
            "diacritics": false,
            "separateWordSearch": false,
            "filter": function(){
                // it should be called only once, as there's only one text node
                called++;
            },
            "done": function () {
                done();
            }
        });
    });

    it("should ignore duplicate context elements", function () {
        expect(called).toBe(1);
    });
});
