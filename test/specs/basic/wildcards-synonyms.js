/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("basic mark with wildcards and synonyms", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        loadFixtures("basic/wildcards-synonyms.html");

        $ctx1 = $(".basic-wildcards-synonyms > div:nth-child(1)");
        $ctx2 = $(".basic-wildcards-synonyms > div:nth-child(2)");
        new Mark($ctx1[0]).mark("Lor?m", {
            "synonyms": {
                "Lor?m": "Ips?m"
            },
            "separateWordSearch": false,
            "wildcards": "enabled",
            "done": function () {
                new Mark($ctx2[0]).mark("Lor*m", {
                    "synonyms": {
                        "Lor*m": "Ips*m"
                    },
                    "separateWordSearch": false,
                    "wildcards": "enabled",
                    "done": done
                });
            }
        });
    });

    it("should match wildcards inside of synonyms", function () {
        expect($ctx1.find("mark")).toHaveLength(10);
        expect($ctx2.find("mark")).toHaveLength(17);
    });
});
