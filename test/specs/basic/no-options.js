/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with no options", function () {
    var $ctx, err;
    beforeEach(function () {
        loadFixtures("basic/no-options.html");

        $ctx = $(".basic-no-options");
        err = false;
        try{
            new Mark($ctx[0]).mark("lorem ipsum");
        } catch(e){
            err = true;
        }
    });

    it("should not throw an error", function () {
        expect(err).toBe(false);
    });
    it("should wrap matches", function () {
        expect($ctx.find("mark").length).toBeGreaterThan(0);
    });
});
