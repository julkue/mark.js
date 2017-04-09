/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";

describe("mark with range", function () {
    var $ctx1, $ctx2, ranges, array, notFound;

    // in case the fixture whitespace is altered
    function getRange($el, string) {
        var start = $el[0].textContent.indexOf(string),
            end = start + string.length;
        return start > -1 ? [start, end] : [];
    }

    beforeEach(function (done) {
        loadFixtures("ranges/ranges.html");
        notFound = [];
        ranges = [];

        $ctx1 = $(".ranges > div:nth-child(1)");
        $ctx2 = $(".ranges > div:nth-child(2)");

        // single word; additional values should be ignored
        array = getRange($ctx1, "nonumy");
        ranges.push([array[0], array[1], 92, "94"]);
        // characters spanning spaces
        ranges.push(getRange($ctx1, "nt ut labor"));
        array = getRange($ctx1, "vero");
        // will be parsed into integers
        ranges.push([array[0] + ".674", array[1] + .234]);

        new Mark($ctx1[0]).markRanges(ranges, {
            "done": function () {
                new Mark($ctx2[0]).markRanges([[10, 10]], {
                    "noMatch": function (item) {
                        notFound = item;
                    },
                    "done": done
                })
            }
        });
    });

    it("should mark correct range and set data-range attributes", function () {
        var $match = $ctx1.find("mark:eq(0)"),
            range = getRange($ctx1, "nonumy");
        expect($match.text()).toEqual("nonumy");
        expect($match.attr('data-range-start')).toEqual(range[0].toString());
        expect($match.attr('data-range-end')).toEqual(range[1].toString());
        // extra mark around <br>
        expect($ctx1.find("mark")).toHaveLength(4);
    });
    it("should mark correct range including spaces and breaks", function () {
        var range = getRange($ctx1, "nt ut labor"),
            $match = $ctx1.find("mark[data-range-start='"+ range[0] + "']");
        expect($match.text()).toEqual("nt ut labor");
        expect($match.attr("data-range-start")).toEqual(range[0].toString());
        expect($match.attr("data-range-end")).toEqual(range[1].toString());
    });
    it("should mark and parse integer ranges", function () {
        var vero = getRange($ctx1, "vero"),
            $match = $ctx1.find("mark[data-range-start='" + vero[0] + "']");
        expect($match.text()).toEqual("vero");
        expect($match.attr('data-range-end')).toEqual(vero[1].toString());
    });
    it("should ignore range with equal start and end", function () {
        expect(notFound).toEqual([[10, 10]]);
    });
});
