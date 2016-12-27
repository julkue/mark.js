/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with multiple same keywords", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/same-keywords.html");

        $ctx = $(".basic-same-keywords");
        new Mark($ctx[0]).mark(["test", "test"], {
            "diacritics": false,
            "separateWordSearch": false,
            "done": function () {
                done();
            }
        });
    });

    it("matches should be wrapped only once", function () {
        expect($ctx.find("mark")).toHaveLength(1);
    });
});
