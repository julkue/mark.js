/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark called with a context NodeList", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/nodelist.html");

        $ctx = $(".basic-nodelist");
        new Mark(document.querySelectorAll(".basic-nodelist")).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "done": done
        });
    });

    it("should wrap matches", function () {
        expect($ctx.find("mark")).toHaveLength(8);
    });
});
