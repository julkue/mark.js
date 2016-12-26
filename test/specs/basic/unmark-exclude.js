/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic unmark with exclude", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/unmark-exclude.html");

        $ctx = $(".basic-unmark-exclude");
        new Mark($ctx[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "done": function () {
                new Mark($ctx[0]).unmark({
                    "exclude": [
                        "*[data-ignore] *",
                        ".ignore *"
                    ],
                    "done": function(){
                        done();
                    }
                });
            }
        });
    });

    it("should not unmark inside exclude selectors", function () {
        expect($ctx.find("mark")).toHaveLength(2);
    });
});
