/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe(
    "mark with acrossElements and regular expression with infinite matches",
    function () {
        var $ctx;
        beforeEach(function (done) {
            loadFixtures("across-elements/regexp/infinite.html");

            $ctx = $(".across-elements-regexp-infinite");
            new Mark($ctx[0]).markRegExp(/(|)/gmi, {
                "acrossElements": true,
                "done": done
            });
        });

        it(
            "should not mark regular expressions with infinite matches",
            function () {
                expect($ctx.find("mark")).toHaveLength(0);
            }
        );
    }
);
