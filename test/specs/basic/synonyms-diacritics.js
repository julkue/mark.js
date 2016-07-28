/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with synonyms and diacritics", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("basic-synonyms-diacritics.html");

        $ctx = $(".basic-synonyms-diacritics");
        new Mark($ctx[0]).mark(["dolor", "amet"], {
            "separateWordSearch": false,
            "synonyms": {
                "dolor": "justo"
            },
            "done": function () {
                done();
            }
        });
    });

    it("should find synonyms with diacritics", function () {
        expect($ctx.find("mark")).toHaveLength(13);
    });
});
