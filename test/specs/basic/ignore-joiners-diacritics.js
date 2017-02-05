/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with ignoreJoiners and diacritics", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/ignore-joiners-diacritics.html");

        $ctx = $(".basic-ignore-joiners-diacritics");
        new Mark($ctx.get()).mark(["Dolor", "Lorem ipsum"], {
            "separateWordSearch": false,
            "ignoreJoiners": true,
            "diacritics": true,
            "done": done
        });
    });

    it("should find matches containing diacritics", function () {
        expect($ctx.find("mark")).toHaveLength(15);
    });
});
