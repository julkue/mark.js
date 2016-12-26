/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with acrossElements and regular expression", function () {
    var $ctx;
    beforeEach(function (done) {
        loadFixtures("across-elements/regexp/main.html");

        $ctx = $(".across-elements-regexp");
        new Mark($ctx[0]).markRegExp(/lorem[\s]+ipsum/gmi, {
            "acrossElements": true,
            "done": done
        });
    });

    it("should wrap matches", function () {
        expect($ctx.find("mark")).toHaveLength(6);
    });
});
