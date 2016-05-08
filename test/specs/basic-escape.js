/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with regex characters", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-escape.html");

        $ctx = $(".basic-escape");
        new Mark($ctx[0]).mark(["39,00 €", "0.009 €", "Unk?nown", "Some+>thing"], {
            "diacritics": false,
            "separateWordSearch": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should escape search terms and wrap matches", function () {
        expect($ctx.find("mark")).toHaveLength(4);
    });
    it("should not modify text node values", function () {
        expect($ctx.find("mark").get(0)).toContainText("39,00 €");
        expect($ctx.find("mark").get(1)).toContainText("0.009 €");
        expect($ctx.find("mark").get(2)).toContainText("Unk?nown");
        expect($ctx.find("mark").get(3)).toContainText("Some+>thing");
    });
});
