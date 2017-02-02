/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with wildcards", function () {
    var $ctx1, $ctx2, $ctx3;
    beforeEach(function (done) {
        loadFixtures("basic/wildcards.html");

        $ctx1 = $(".basic-wildcards > div:nth-child(1)");
        $ctx2 = $(".basic-wildcards > div:nth-child(2)");
        $ctx3 = $(".basic-wildcards > div:nth-child(3)");
        new Mark($ctx1.get()).mark("lor?m", {
            "separateWordSearch": false,
            "useWildcards": true,
            "done": function () {
                new Mark($ctx2[0]).mark("lor*m", {
                    "separateWordSearch": false,
                    "useWildcards": true,
                    "done": function () {
                        new Mark($ctx3[0]).mark(["lor?m", "Lor*m"], {
                            "separateWordSearch": false,
                            "useWildcards": false,
                            "done": done
                        });
                    }
                });
            }
        });
    });

    it("should find '?' wildcard matches", function () {
        expect($ctx1.find("mark")).toHaveLength(5);
    });
    it("should find '*' wildcard matches", function () {
        expect($ctx2.find("mark")).toHaveLength(8);
    });
    it("should find wildcards as plain characters when disabled", function(){
        expect($ctx3.find("mark")).toHaveLength(2);
    });
});
