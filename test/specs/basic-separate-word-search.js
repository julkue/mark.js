/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with separate word search", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-separate-word-search.html");

        $ctx1 = $(".basic-separate > p:first-child");
        $ctx2 = $(".basic-separate > p:last-child");
        new Mark($ctx1[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": true,
            "done": function () {
                new Mark($ctx2[0]).mark(["lorem ipsum"], {
                    "diacritics": false,
                    "separateWordSearch": true,
                    "done": function () {
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).remove();
    });

    it("should wrap separated words", function () {
        expect($ctx1.find("mark")).toHaveLength(8);
        expect($ctx2.find("mark")).toHaveLength(8);
    });
});
