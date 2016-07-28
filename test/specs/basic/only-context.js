/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark directly inside the context", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic-only-context.html");

        $ctx = $(".basic-only-context");
        new Mark($ctx[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "done": function () {
                done();
            }
        });
    });

    it("should wrap matches", function () {
        expect($ctx.find("mark")).toHaveLength(4);
    });
});
