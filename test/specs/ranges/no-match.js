/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with range no matches", function () {
    var $ctx1, $ctx2, $ctx3, errCall, notFound;
    beforeEach(function (done) {
        loadFixtures("ranges/no-match.html");
        errCall = 0;
        notFound = [];

        $ctx1 = $(".ranges-no-match > div:nth-child(1)");
        $ctx2 = $(".ranges-no-match > div:nth-child(2)");
        $ctx3 = $(".ranges-no-match > div:nth-child(3)");
        // [0, 3] "should" only contain whitespace
        new Mark($ctx1[0]).markRanges([[-20, -12], [0, 3], [1500, 2000]], {
            "noMatch": function(item) {
                notFound = notFound.concat(item);
            },
            "done": function () {
                new Mark($ctx2[0]).markRanges([[-8, 5], [-1, 20], [99, 9999]], {
                    "noMatch": function(item) {
                        notFound = notFound.concat(item);
                    },
                    "done": function() {
                        new Mark($ctx3[0]).markRanges([[88, 8888]], {
                            invalidMax: false,
                            "noMatch": function(item) {
                                notFound = notFound.concat(item);
                            },
                            "done": function () {
                                // non-array first element throws an error
                                try {
                                    new Mark($ctx3[0]).markRanges(["pie"], {
                                        "noMatch": function(item) {
                                            notFound = notFound.concat(item);
                                        },
                                        "done": done
                                    });
                                } catch (err) {
                                    errCall++;
                                    done();
                                }
                            }
                        });
                    }
                });
            }
        });
    });

    it("should report range non-matches", function () {
        expect($ctx1.find("mark")).toHaveLength(0);
        expect($ctx2.find("mark")).toHaveLength(0);
        var ranges = notFound.sort(function(a, b) {
            return a[0] - b[0];
        });
        expect(JSON.stringify(ranges))
            .toEqual("[[-20,-12],[-8,5],[-1,20],[0,3],[99,9999],[1500,2000]]");
        expect(errCall).toBe(1);
    });
    it("should allow out of range max with invalidMax disabled", function () {
        var $mark3 = $ctx3.find("mark");
        // using 2 because the closing </p> gets wrapped creating a second mark
        expect($mark3).toHaveLength(2);
        expect($mark3.attr("data-range-start")).toBe("88");
        // end range does not get adjusted
        expect($mark3.attr("data-range-end")).toBe("8888");
    });
});
