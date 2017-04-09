/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with range filter callback", function () {
    var $ctx, filterCalled, termCount, rangeCount, ranges, results,
        // will target the first unique term 
        terms = ["ipsum", "amet", "elitr", "nonumy", "tempor"],
        // term to filter out
        skip = "elitr";

    // in case the fixture whitespace is altered
    function getRange($el, string) {
        var start = $el.text().indexOf(string),
            end = start + string.length;
        return start > -1 ? [start, end] : null;
    }

    beforeEach(function (done) {
        loadFixtures("ranges/filter.html");
        filterCalled = 0;
        termCount = 0;
        rangeCount = 0;
        $ctx = $(".ranges-filter");
        ranges = [];
        results = {};

        terms.forEach(function(item, index) {
            var range = getRange($ctx, item);
            if (range) {
                results[item] = {
                    "name": item,
                    "range": range,
                    "index": index
                };
                ranges.push(range);
            }
        });

        new Mark($ctx[0]).markRanges(ranges, {debug:true,
            "filter": function (range, match, node, counter) {
                filterCalled++;
                var item = results[match];
                if (item && item.index === counter) {
                    termCount++;
                    if (item.range.toString() === range.toString()) {
                        rangeCount++;
                    }
                }
                return match !== skip;
            },
            "done": done
        });
    });

    it("should call the filter callback for each range element", function () {
        var len = terms.length;
        expect(filterCalled).toBe(len);
        expect(termCount).toBe(len);
        expect(rangeCount).toBe(len);
        expect($ctx.find("mark")).toHaveLength(len - 1);
        expect($ctx.find("mark:contains(" + skip + ")")).toHaveLength(0);
    });
});
