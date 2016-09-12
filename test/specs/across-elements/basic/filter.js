/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with acrossElements and filter callback", function () {
    var $ctx;
    beforeEach(function () {
        loadFixtures("across-elements/basic/filter.html");

        $ctx = $(".across-elements-filter");
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
            "acrossElements": true,
            "filter": function (node, term, totalMatches, matches) {
                expect(node.nodeType).toBe(3);
                expect($.inArray(term, textOpts)).toBeGreaterThan(-1);
                expect(k).toBe(totalMatches);
                expect(i[term]).toBe(matches);
                if(term !== "dolor") {
                    i[term]++;
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
