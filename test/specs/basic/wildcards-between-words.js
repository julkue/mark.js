/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with wildcards between words", function () {
    var $ctx1, $ctx2, $ctx3, $ctx4;
    beforeEach(function (done) {
        loadFixtures("basic/wildcards-between-words.html");

        $ctx1 = $(".basic-wildcards-between-words > div:nth-child(1)");
        $ctx2 = $(".basic-wildcards-between-words > div:nth-child(2)");
        $ctx3 = $(".basic-wildcards-between-words > div:nth-child(3)");
        $ctx4 = $(".basic-wildcards-between-words > div:nth-child(4)");
        new Mark($ctx1[0]).mark("lorem?ipsum", {
            "separateWordSearch": false,
            "wildcards": "enable",
            "done": function () {
                new Mark($ctx2[0]).mark("lorem*ipsum", {
                    "separateWordSearch": false,
                    "wildcards": "enable",
                    "done": function () {
                        new Mark($ctx3[0]).mark("lorem?ipsum", {
                            "separateWordSearch": false,
                            "wildcards": "includeSpaces",
                            "done": function () {
                                new Mark($ctx4[0]).mark("lorem*ipsum", {
                                    "separateWordSearch": false,
                                    "wildcards": "includeSpaces",
                                    "done": done
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it(
        "should match wildcard of single non-whitespace in the keyword pattern",
        function () {
            expect($ctx1.find("mark")).toHaveLength(3);
        }
    );
    it(
        "should match wildcard of zero+ non-whitespaces in the keyword pattern",
        function () {
            expect($ctx2.find("mark")).toHaveLength(4);
        }
    );
    it(
        "should match wildcard of any single character in the keyword pattern",
        function () {
            expect($ctx3.find("mark")).toHaveLength(5);
        }
    );
    it(
        "should match wildcard of zero+ characters in the keyword pattern",
        function () {
            expect($ctx4.find("mark")).toHaveLength(8);
        }
    );

});
