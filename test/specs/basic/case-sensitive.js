/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("case senstive mark", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/case-sensitive.html");

        $ctx = $(".case-sensitive");
        new Mark($ctx.get()).mark("At", {
            "caseSensitive": true,
            "done": function () {
                done();
            }
        });
    });

    it("should find case sensitive matches", function () {
        expect($ctx.find("mark")).toHaveLength(2);
    });
});
