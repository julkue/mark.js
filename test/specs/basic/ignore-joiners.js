/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with ignoreJoiners", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        loadFixtures("basic/ignore-joiners.html");

        $ctx1 = $(".basic-ignore-joiners > div:nth-child(1)");
        $ctx2 = $(".basic-ignore-joiners > div:nth-child(2)");
        new Mark($ctx1.get()).mark("Lorem ipsum", {
            "separateWordSearch": false,
            "ignoreJoiners": true,
            "done": function () {
                new Mark($ctx2[0]).mark(["ipsum"], {
                    "separateWordSearch": false,
                    "ignoreJoiners": false,
                    "done": done
                });
            }
        });
    });

    it("should find matches when enabled", function () {
        expect($ctx1.find("mark")).toHaveLength(4);
    });
    it("should not find matches when disabled", function(){
        expect($ctx2.find("mark")).toHaveLength(2);
    });
});
