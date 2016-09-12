/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe(
    "basic mark with array consisting of partial duplicate words",
    function () {
        var $ctx;
        beforeEach(function (done) {
            loadFixtures("basic/partial-duplicate-words.html");

            $ctx = $(".basic-partial-duplicate-words");
            new Mark($ctx[0]).mark(["test", "lorem test ipsum"], {
                "diacritics": false,
                "separateWordSearch": false,
                "done": done
            });
        });

        it("should wrap all array strings", function () {
            expect($ctx.find("mark")).toHaveLength(3);
        });
    }
);
