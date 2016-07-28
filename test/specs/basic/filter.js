/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with 'filter' callback", function () {
    var $ctx;
    beforeEach(function () {
        loadFixtures("basic-filter.html");

        $ctx = $(".basic-filter");
    });

    it("should call the callback with the right parameters", function (done) {
        var i = {
                "lorem": 0,
                "ipsum": 0,
                "dolor": 0
            },
            k = 0,
            textOpts = ["lorem", "ipsum", "dolor"];
        new Mark($ctx[0]).mark(textOpts, {
            "diacritics": false,
            "separateWordSearch": false,
            "filter": function (node, term, matches, totalMatches) {
                expect(node.nodeType).toBe(3);
                expect($.inArray(term, textOpts)).toBeGreaterThan(-1);
                expect(i[term]).toBe(matches);
                expect(k).toBe(totalMatches);
                if(term !== "dolor") {
                    i[term]++
                        k++;
                    return true;
                } else {
                    return false;
                }
            },
            "done": function () {
                expect($ctx.find("mark")).toHaveLength(8);
                done();
            }
        });
    });
});
