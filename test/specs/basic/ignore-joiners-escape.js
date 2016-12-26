/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with ignoreJoiners and special characters", function () {
    var err, $ctx;
    beforeEach(function (done) {
        loadFixtures("basic/ignore-joiners-escape.html");

        $ctx = $(".basic-ignore-joiners-escape");
        err = false;
        try {
            new Mark($ctx.get()).mark([
                "Lorem ipsum+",
                "sit*",
                "amet?",
                "$50",
                "{no}"
            ], {
                "separateWordSearch": false,
                "ignoreJoiners": true,
                "done": done
            });
        } catch(e) {
            err = true;
            done();
        }
    });

    it("should find matches", function () {
        expect(err).toBe(false);
        expect($ctx.find("mark")).toHaveLength(8);
    });
});
