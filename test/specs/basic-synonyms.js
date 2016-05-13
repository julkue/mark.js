/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with synonyms", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-synonyms.html");

        $ctx1 = $(".basic-synonyms > p:first-child");
        $ctx2 = $(".basic-synonyms > p:not(:first-child)");
        new Mark($ctx1[0]).mark("lorem", {
            "synonyms": {
                "lorem": "ipsum"
            },
            "separateWordSearch": false,
            "diacritics": false,
            "done": function () {
                new Mark($ctx2.get()).mark(["one", "2", "lüfte"], {
                    "separateWordSearch": false,
                    "diacritics": false,
                    "synonyms": {
                        "ü": "ue",
                        "one": "1",
                        "two": "2"
                    },
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

    it("should wrap synonyms as well as keywords", function () {
        expect($ctx1.find("mark")).toHaveLength(8);
        expect($ctx2.find("mark")).toHaveLength(4);
    });
});
