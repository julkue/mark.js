/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with accuracy complementary", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        loadFixtures("basic-accuracy-complementary.html");

        $ctx1 = $(".basic-accuracy-complementary > div:first-child");
        $ctx2 = $(".basic-accuracy-complementary > div:last-child");
        new Mark($ctx1[0]).mark("lorem", {
            "accuracy": "complementary",
            "separateWordSearch": false,
            "done": function () {
                new Mark($ctx2[0]).mark("lorem", {
                    "accuracy": "complementary",
                    "separateWordSearch": true,
                    "done": function () {
                        done();
                    }
                });
            }
        });
    });

    it("should wrap the right matches", function () {
        expect($ctx1.find("mark")).toHaveLength(1);
        expect($ctx1.find("mark").text()).toBe("testLoremtest");
    });
    it("should work with separateWordSearch", function () {
        var textOpts = ["testLorem", "ipsumtest"];
        $ctx2.find("mark").each(function () {
            expect($.inArray($(this).text(), textOpts)).toBeGreaterThan(-1);
        });
    });
});
