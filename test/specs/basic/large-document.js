/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark in large documents", function () {
    var $ctx, err, start, end, diff;
    beforeEach(function (done) {
        loadFixtures("basic/large-document.html");

        $ctx = $(".basic-large-document");
        err = false;
        start = new Date();
        try {
            new Mark($ctx[0]).mark("lorem", {
                "diacritics": false,
                "separateWordSearch": false,
                "done": function () {
                    end = new Date();
                    diff = end.getTime() - start.getTime();
                    done();
                }
            });
        } catch(e) {
            err = true;
        }
    }, 60000);

    it("should not throw a recursion error", function () {
        expect(err).toBe(false);
    });
    it("should wrap matches", function () {
        expect($ctx.find("mark")).toHaveLength(9569);
    });
    it("should be faster than 15 seconds", function () {
        // normally 10 seconds, but IE9 needs more time -.-
        expect(diff).toBeLessThan(15000);
    });
});
