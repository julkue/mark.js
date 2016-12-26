/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with acrossElements and ignoreJoiners", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("across-elements/basic/ignore-joiners.html");

        $ctx = $(".across-elements-ignore-joiners");
        new Mark($ctx[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "acrossElements": true,
            "ignoreJoiners": true,
            "done": done
        });
    });

    it("should wrap matches and ignoreJoiners", function () {
        expect($ctx.find("mark")).toHaveLength(6);
    });
});
