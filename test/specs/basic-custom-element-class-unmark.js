/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic unmark with custom element and class", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-custom-element-class.html");

        $ctx = $(".basic-custom-element-class > p:first-child");
        var instance = new Mark($ctx[0]);
        instance.mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "element": "i",
            "className": "custom",
            "complete": function () {
                instance.unmark({
                    "element": "i",
                    "className": "custom",
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

    it("should remove all marked elements", function () {
        expect($ctx).not.toContainElement("i.custom");
    });
});
