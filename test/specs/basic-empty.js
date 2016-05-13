/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark in an empty context", function () {
    var $ctx1, $ctx2, done1 = false,
        done2 = false;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-empty.html");

        $ctx1 = $(".notExistingSelector");
        $ctx2 = $(".basic-empty");
        new Mark($ctx1[0]).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "done": function () {
                done1 = true;
                new Mark($ctx2[0]).mark("lorem", {
                    "diacritics": false,
                    "separateWordSearch": false,
                    "done": function () {
                        done2 = true;
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).remove();
    });

    it("should call the 'done' function", function () {
        expect(done1).toBe(true);
        expect(done2).toBe(true);
    });
});
