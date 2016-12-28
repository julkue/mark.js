/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark directly inside the context", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/context-direct.html");

        $ctx = $(".basic-context-direct");
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
