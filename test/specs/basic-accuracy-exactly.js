/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with exactly accuracy", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-accuracy-exactly.html");

        $ctx1 = $(".basic-accuracy-exactly > p:first-child");
        $ctx2 = $(".basic-accuracy-exactly > p:last-child");
        new Mark($ctx1[0]).mark("dolo", {
            "accuracy": "exactly",
            "separateWordSearch": false,
            "complete": function () {
                new Mark($ctx2[0]).mark("ipsum dolo", {
                    "accuracy": "exactly",
                    "separateWordSearch": true,
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

    it("should wrap the right matches", function () {
        expect($ctx1.find("mark")).toHaveLength(1);
        expect($ctx1.find("mark").text()).toBe("dolo");
    });
    it("should work with separateWordSearch", function () {
        expect($ctx2.find("mark")).toHaveLength(5);
        $ctx2.find("mark").each(function () {
            var text = $(this).text();
            var containsText = text === "ipsum" || text === "dolo";
            expect(containsText).toBe(true);
        });
    });
});
