/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with an array of keywords", function () {
    var $ctx, notFound;
    beforeEach(function (done) {
        loadFixtures("basic/array-keyword.html");

        $ctx = $(".basic-array-keyword");
        notFound = [];
        new Mark($ctx[0]).mark(["lorem", "ipsum", "test", "hey"], {
            "diacritics": false,
            "separateWordSearch": false,
            "noMatch": function (term) {
                notFound.push(term);
            },
            "done": done
        });
    });

    it("should wrap all matching keywords from the array", function () {
        expect($ctx.find("mark")).toHaveLength(8);
    });
    it("should call noMatch for not found array items", function () {
        expect(notFound).toEqual(["test", "hey"]);
    });
});
