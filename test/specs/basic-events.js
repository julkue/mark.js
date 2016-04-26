/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("unmark with click event", function () {
    var $ctx, spyEvent;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-events.html");

        $ctx = $(".basic-events");
        spyEvent = spyOnEvent(".basic-events .event-target", "click");
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
        expect(spyEvent).toHaveBeenTriggered();
    });

});
