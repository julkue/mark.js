/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("mark with regular expression", function () {
    var $ctx, ret;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("regexp.html");

        $ctx = $(".regexp");
        ret = new Mark($ctx[0]).markRegExp(/Lor[^]?m/gmi, {
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
    it("should return an object with further methods", function () {
        expect(ret instanceof Mark).toBe(true);
        expect(typeof ret.mark).toBe("function");
        expect(typeof ret.unmark).toBe("function");
        expect(typeof ret.markRegExp).toBe("function");
    });
});
