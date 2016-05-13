/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with filter", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic-filter.html");

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

    it("should exclude matches that are inside a filter selector", function () {
        expect($ctx.find("mark")).toHaveLength(4);
    });
});
