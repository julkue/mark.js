/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with regular expression with infinite results", function () {
    var $ctx1, $ctx2, errorThrown;
    beforeEach(function (done) {
        loadFixtures("regexp/infinite.html");

        $ctx1 = $(".regexp-infinite > div:first-child");
        $ctx2 = $(".regexp-infinite > div:last-child");
        errorThrown = false;
        new Mark($ctx1[0]).markRegExp(/(|)/gmi, {
            "done": function () {
                try {
                    new Mark($ctx2[0]).markRegExp(/\b/gmi, {
                        "done": function () {
                            // timeout, otherwise "ret =" will not be executed
                            setTimeout(function () {
                                done();
                            }, 50);
                        }
                    });
                } catch(e) {
                    errorThrown = true;
                    done();
                }
            }
        });
    });

    it(
        "should not mark regular expressions with infinite matches",
        function () {
            expect($ctx1.find("mark")).toHaveLength(0);
        }
    );
    it("should not mark regular expression with infinite matches on breaks",
        function () {
            expect($ctx2.find("mark")).toHaveLength(0);
            expect(errorThrown).toBe(false);
        }
    );
});
