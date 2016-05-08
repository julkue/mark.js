/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with custom element and class", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-custom-element-class.html");

        $ctx1 = $(".basic-custom-element-class > p:first-child");
        $ctx2 = $(".basic-custom-element-class > p:last-child");
        new Mark($ctx1[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "element": "i",
            "complete": function () {
                new Mark($ctx2[0]).mark("lorem ipsum", {
                    "diacritics": false,
                    "separateWordSearch": false,
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
        $ctx1.add($ctx2).remove();
    });

    it("should not add a class to matched elements if specified", function () {
        expect($ctx1.find("i")).toHaveLength(4);
    });
    it("should wrap matches with specified element and class", function () {
        expect($ctx2.find("i.custom")).toHaveLength(4);
    });
});
