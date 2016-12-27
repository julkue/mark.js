/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with regular expression and filter callback", function () {
    var $ctx;
    beforeEach(function () {
        loadFixtures("regexp/filter.html");

        $ctx = $(".regexp-filter");
    });

    it("should call the callback with the right parameters", function (done) {
        var k = 0,
            textOpts = ["Lorem", "ipsum"];
        new Mark($ctx[0]).markRegExp(/(Lore?m)|(ipsum)/gmi, {
            "filter": function (node, term, totalMatches) {
                expect(node.nodeType).toBe(3);
                expect($.inArray(term, textOpts)).toBeGreaterThan(-1);
                expect(k).toBe(totalMatches);
                if(term !== "ipsum") {
                    k++;
                    return true;
                } else {
                    return false;
                }
            },
            "done": function () {
                expect($ctx.find("mark")).toHaveLength(4);
                done();
            }
        });
    });
});
