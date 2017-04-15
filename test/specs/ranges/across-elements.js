/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with range across elements", function () {
    var $ctx, txt, ranges, index;
    beforeEach(function (done) {
        loadFixtures("ranges/across-elements.html");
        $ctx = $(".ranges-across-elements");
        txt = $ctx.text();
        ranges = [];

        // searching for "do<span>lor sit</span> amet"
        index = txt.indexOf("dolor");
        // don't include span tags when determining end
        ranges.push({ start: index, len: 14 });

        // searching for "amet.\n    </p><p>\n        Testing"
        index = txt.lastIndexOf("amet");
        ranges.push({ start: index, end: txt.indexOf(" 1234") });

        new Mark($ctx[0]).markRanges(ranges, {
            "done": done
        });
    });

    it("should properly mark ranges across elements", function () {
        var match1 = $ctx.find(
                "mark[data-range-start=" + ranges[0].start + "]"
            ).text(),
            match2 = $ctx.find(
                "mark[data-range-start=" + ranges[1].start + "]"
            ).text().replace(/\s+/g, "");
        expect(match1).toEqual("dolor sit amet");
        expect(match2).toEqual("amet.Testing");
    });
});
