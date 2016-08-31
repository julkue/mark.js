/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark in large documents", function () {
    var $ctx, err;
    beforeEach(function (done) {
        loadFixtures("basic/large-document.html");

        $ctx = $(".basic-large-document");
        err = false;
        try{
            new Mark($ctx[0]).mark("lorem", {
                "diacritics": false,
                "separateWordSearch": false,
                "done": done
            });
        } catch(e){
            err = true;
        }
    });

    it("should wrap matches without recursion error", function () {
        expect(err).toBe(false);
        expect($ctx.find("mark")).toHaveLength(13028);
    });
});
