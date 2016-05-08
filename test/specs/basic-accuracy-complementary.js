/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with complementary accuracy", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-accuracy-complementary.html");

        $ctx1 = $(".basic-accuracy-complementary > p:first-child");
        $ctx2 = $(".basic-accuracy-complementary > p:last-child");
        new Mark($ctx1[0]).mark("lorem", {
            "accuracy": "complementary",
            "separateWordSearch": false,
            "complete": function () {
                new Mark($ctx2[0]).mark("lorem", {
                    "accuracy": "complementary",
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
        expect($ctx1.find("mark").text()).toBe("testLoremtest");
    });
    it("should work with separateWordSearch", function () {
        $ctx2.find("mark").each(function () {
            var text = $(this).text();
            var containsText = text === "testLorem" || text === "ipsumtest";
            expect(containsText).toBe(true);
        });
    });
});
