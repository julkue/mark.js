/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark called with jquery", function () {
    var $ctx, ret;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        $ctx = $(".basic");
        ret = $ctx.mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "complete": function () {
                setTimeout(function(){ // otherwise "ret =" will not be executed
                    done();
                }, 50);
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("mark")).toHaveLength(4);
    });
    it("should return the provided context jquery element", function(){
        expect(ret instanceof $).toBe(true);
        expect(ret).toBeMatchedBy(".basic");
    });
});
