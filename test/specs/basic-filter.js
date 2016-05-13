/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark with filter", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-filter.html");

        $ctx = $(".basic-filter");
        new Mark($ctx[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "filter": [
                "*[data-ignore]",
                ".ignore"
            ],
            "done": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should exclude matches that are inside a filter selector", function () {
        expect($ctx.find("mark")).toHaveLength(4);
    });
});
