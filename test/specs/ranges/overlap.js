/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark ranges ignoring overlapping values", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("ranges/overlap.html");

        $ctx = $(".ranges-overlap");
        new Mark($ctx[0]).markRanges([[20,30], [25, 26], [40,50], [45, 46]], {
            "done": done
        });
    });

    it("should ignore overlapping ranges", function () {
        expect($ctx.find("mark")).toHaveLength(2);
        expect($ctx.find("mark[data-range-start=25]")).toHaveLength(0);
        expect($ctx.find("mark[data-range-start=45]")).toHaveLength(0);
    });
});
