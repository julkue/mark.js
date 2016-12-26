/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with separateWordsearch", function () {
    var $ctx1, $ctx2, notFound;
    beforeEach(function (done) {
        loadFixtures("basic/separate-word-search.html");

        $ctx1 = $(".basic-separate > div:first-child");
        $ctx2 = $(".basic-separate > div:last-child");
        notFound = [];
        new Mark($ctx1[0]).mark("lorem ipsum test", {
            "diacritics": false,
            "separateWordSearch": true,
            "noMatch": function (term) {
                notFound.push(term);
            },
            "done": function () {
                new Mark($ctx2[0]).mark(["lorem ipsum"], {
                    "diacritics": false,
                    "separateWordSearch": true,
                    "done": done
                });
            }
        });
    });

    it("should wrap separated words", function () {
        expect($ctx1.find("mark")).toHaveLength(8);
        expect($ctx2.find("mark")).toHaveLength(8);
    });
    it("should call the noMatch callback for separated words", function () {
        expect(notFound).toEqual(["test"]);
    });
});
