/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("mark with regular expression called with jquery", function () {
    var $ctx, ret;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("regexp.html");

        $ctx = $(".regexp");
        ret = $ctx.markRegExp(/Lor[^]?m/gmi, {
            "complete": function () {
                setTimeout(function () { // otherwise "ret =" will not be executed
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
        expect(ret).toBeMatchedBy(".regexp");
    });
});
