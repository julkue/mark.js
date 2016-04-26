/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark in an empty context", function () {
    var $ctx1, $ctx2, complete1 = false,
        complete2 = false;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-empty.html");

        $ctx1 = $(".notExistingSelector");
        $ctx2 = $(".basic-empty");
        new Mark($ctx1[0]).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "complete": function () {
                complete1 = true;
                new Mark($ctx2[0]).mark("lorem", {
                    "diacritics": false,
                    "separateWordSearch": false,
                    "complete": function () {
                        complete2 = true;
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).remove();
    });

    it("should call the complete function", function () {
        expect(complete1).toBe(true);
        expect(complete2).toBe(true);
    });
});
