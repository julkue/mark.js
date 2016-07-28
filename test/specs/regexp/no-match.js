/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with regular expression and 'noMatch' callback", function () {
    var $ctx, notFound, notFoundCalled;
    beforeEach(function (done) {
        loadFixtures("regexp.html");

        $ctx = $(".regexp > div:first-child");
        notFound = null;
        notFoundCalled = 0;
        new Mark($ctx[0]).markRegExp(/test/gmi, {
            "noMatch": function (regexp) {
                notFoundCalled++;
                notFound = regexp;
            },
            "done": function () {
                done();
            }
        });
    });

    it("should call 'notFound' with the regular expression", function () {
        expect(notFoundCalled).toBe(1);
        expect(notFound instanceof RegExp).toBe(true);
    });
});
