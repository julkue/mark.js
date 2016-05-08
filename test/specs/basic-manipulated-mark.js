/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("unmark with elements inside marked elements", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-manipulated-mark.html");

        $ctx = $(".basic-manipulated-mark");
        var instance = new Mark($ctx[0]);
        instance.mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "complete": function () {
                $("<span />", {
                    "html": "test",
                    "id": "manipulatedMark"
                }).appendTo($ctx.find("mark").first());
                instance.unmark({
                    "complete": function () {
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should not delete subsequently added elements", function () {
        expect($ctx).toContainElement("#manipulatedMark");
    });
});
