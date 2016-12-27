/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with accuracy complementary and limiters", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/accuracy-complementary-limiters.html");

        $ctx = $(".basic-accuracy-complementary-limiters");
        new Mark($ctx[0]).mark("test", {
            "accuracy": {
                "value": "complementary",
                "limiters": [
                    ",", ".", "-", "!", "\"", "'", "(", ")", "%"
                ]
            },
            "separateWordSearch": false,
            "done": done
        });
    });

    it("should wrap matches without custom limiters", function () {
        expect($ctx.find("mark")).toHaveLength(8);
        var textOpts = ["loremtestlorem", "loremtest", "test"];
        $ctx.find("mark").each(function () {
            expect($.inArray($(this).text(), textOpts)).toBeGreaterThan(-1);
        });
    });
});
