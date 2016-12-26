/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark in large documents", function () {
    var $ctx, err, start, end;
    beforeEach(function (done) {
        loadFixtures("basic/large-document.html");

        $ctx = $(".basic-large-document");
        err = false;
        start = new Date();
        try{
            new Mark($ctx[0]).mark("lorem", {
                "diacritics": false,
                "separateWordSearch": false,
                "done": function(){
                    end = new Date();
                    done();
                }
            });
        } catch(e){
            err = true;
        }
    });

    it("should wrap matches without recursion error", function () {
        expect(err).toBe(false);
        expect($ctx.find("mark")).toHaveLength(13028);
        expect(end.getTime() - start.getTime()).toBeLessThan(10000); // 10 sec
    });
});
