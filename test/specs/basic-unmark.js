/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic unmark", function () {
    var $ctx, ret;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        $ctx = $(".basic");
        var instance = new Mark($ctx[0]);
        instance.mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "complete": function () {
                ret = instance.unmark({
                    "complete": function () {
                        // otherwise "ret =" will not be executed
                        setTimeout(function () {
                            done();
                        }, 50);
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should remove all marked elements", function () {
        expect($ctx).not.toContainElement("mark");
    });
    it("should restore the DOM to the original state", function () {
        // all text nodes (including empty nodes from mark-tag removal)
        // should be converted into a single node
        var nodes = $ctx.find("> p")[0].childNodes;
        expect(nodes.length).toBe(1);
    });
    it("should return an object with further methods", function () {
        expect(ret instanceof Mark).toBe(true);
        expect(typeof ret.mark).toBe("function");
        expect(typeof ret.unmark).toBe("function");
        expect(typeof ret.markRegExp).toBe("function");
    });
});
