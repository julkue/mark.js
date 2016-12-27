/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with iframes and exclude", function () {
    var $ctx, $elements;
    beforeEach(function (done) {
        loadFixtures("iframes/exclude.html");

        $elements = $();
        $ctx = $(".iframes-exclude");
        new Mark($ctx[0]).mark("lorem", {
            "diacritics": false,
            "separateWordSearch": false,
            "iframes": true,
            "exclude": [
                ".ignore"
            ],
            "each": function ($m) {
                $elements = $elements.add($($m));
            },
            "done": done
        });
    });

    it("should ignore iframes matching exclude selectors", function () {
        expect($elements).toHaveLength(4);
    });
});
