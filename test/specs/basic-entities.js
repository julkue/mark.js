/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with HTML entities", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-entities.html");

        $ctx1 = $(".basic-entities > p:first-child");
        $ctx2 = $(".basic-entities > p:last-child");
        new Mark($ctx1[0]).mark("Lorem © ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "complete": function () {
                new Mark($ctx2[0]).mark("justo √ duo", {
                    "diacritics": false,
                    "separateWordSearch": false,
                    "complete": function () {
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).remove();
    });

    it("should wrap matches", function () {
        expect($ctx1.find("mark")).toHaveLength(1);
        expect($ctx2.find("mark")).toHaveLength(1);
    });
});
