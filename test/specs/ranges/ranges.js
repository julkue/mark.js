/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";

describe("mark with range", function () {
    var $ctx1, $ctx2, ranges, range, notFound,
        // [single word, characters spanning spaces, anything]
        terms = ["nonumy", "nt ut labor", "vero"];

    // in case the fixture whitespace is altered
    function getRange($el, string) {
        var start = $el.text().indexOf(string),
            end = start + string.length;
        return start > -1 ? { "start": start, "end": end } : null;
    }

    beforeEach(function (done) {
        loadFixtures("ranges/ranges.html");
        notFound = [];
        ranges = [];

        $ctx1 = $(".ranges > div:nth-child(1)");
        $ctx2 = $(".ranges > div:nth-child(2)");

        // single word
        range = getRange($ctx1, terms[0]);
        ranges.push({
            start: range.start,
            len: range.end - range.start,
            // end value will get ignored because "len" overrides "end"
            // internally
            end: range.end + 20
        });
        // characters spanning spaces
        ranges.push(getRange($ctx1, terms[1]));
        range = getRange($ctx1, terms[2]);
        // will be parsed into integers
        ranges.push({ start: range.start + ".674", end: range.end + .234 });

        new Mark($ctx1[0]).markRanges(ranges, {
            "done": function () {
                new Mark($ctx2[0]).markRanges([
                    {start: 10, end: 10},
                    {start: 20, len: 0}
                ], {
                    "noMatch": function (item) {
                        notFound = item;
                    },
                    "done": done
                })
            }
        });
    });

    it("should mark correct range (ignore end when len is set)", function () {
        var $match = $ctx1.find("mark:eq(0)"),
            range = getRange($ctx1, terms[0]);
        expect($match.text()).toEqual(terms[0]);
        expect($match.attr('data-range-start')).toEqual(range.start.toString());
        expect($match.attr('data-range-len'))
            .toEqual((range.end - range.start).toString());
        // end attribute should not have been set
        expect($match.attr('data-range-end') || "").toEqual("");
        // extra mark around <br>
        expect($ctx1.find("mark")).toHaveLength(4);
    });
    it("should mark correct range including spaces and breaks", function () {
        var range = getRange($ctx1, terms[1]),
            $match = $ctx1.find("mark[data-range-start='"+ range.start + "']");
        expect($match.text()).toEqual(terms[1]);
        expect($match.attr("data-range-start")).toEqual(range.start.toString());
        expect($match.attr("data-range-end")).toEqual(range.end.toString());
    });
    it("should mark and parse integer ranges", function () {
        var range = getRange($ctx1, terms[2]),
            $match = $ctx1.find("mark[data-range-start='" + range.start + "']");
        expect($match.text()).toEqual(terms[2]);
        expect($match.attr('data-range-end')).toEqual(range.end.toString());
    });
    it("should ignore range with equal start and end", function () {
        expect(JSON.stringify(notFound)).toEqual(JSON.stringify([
          {start: 10, end: 10},
          {start: 20, len: 0}
        ]));
    });
});
