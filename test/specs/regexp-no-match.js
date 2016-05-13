/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("mark with regular expression and 'noMatch'", function () {
    var $ctx, notFound, notFoundCalled;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("regexp.html");

        $ctx = $(".regexp > p:first-child");
        notFound = null;
        notFoundCalled = 0;
        new Mark($ctx[0]).markRegExp(/test/gmi, {
            "noMatch": function(regexp){
                notFoundCalled++;
                notFound = regexp;
            },
            "done": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should call 'notFound' with the regular expression", function () {
        expect(notFoundCalled).toBe(1);
        expect(notFound instanceof RegExp).toBe(true);
    });
});
