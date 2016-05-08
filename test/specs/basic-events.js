/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("unmark with click event", function () {
    var $ctx, eventCalled;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-events.html");

        $ctx = $(".basic-events");
        eventCalled = 0;
        $ctx.find(".event-target").on("click", function(){
            ++eventCalled;
        });
        var instance = new Mark($ctx[0]);
        instance.mark("test", {
            "diacritics": false,
            "separateWordSearch": false,
            "complete": function () {
                instance.unmark({
                    "complete": function(){
                        $ctx.find(".event-target").click();
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should not remove bound events", function () {
        expect(eventCalled).toBe(1);
    });

});
