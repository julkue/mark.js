/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("basic mark", function () {
    var $ctx1, $ctx2, ret, eachCalled, doneCalled, debugCalled, notFound;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        eachCalled = doneCalled = debugCalled = 0;
        notFound = [];
        $ctx1 = $(".basic > div:first-child");
        $ctx2 = $(".basic > div:last-child");
        ret = new Mark($ctx1[0]).mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": false,
            "each": function () {
                eachCalled++;
            },
            "done": function () {
                doneCalled++;
                new Mark($ctx2[0]).mark("test", {
                    "noMatch": function (term) {
                        notFound.push(term);
                    },
                    "done": function () {
                        // otherwise "ret =" will not be executed
                        setTimeout(function () {
                            done();
                        }, 50);
                    }
                });
            },
            "debug": true,
            "log": {
                "debug": function () {
                    debugCalled++;
                },
                "warn": function () {
                    debugCalled++;
                }
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).remove();
    });

    it("should wrap matches", function () {
        expect($ctx1.find("mark")).toHaveLength(4);
    });
    it("should call the 'each' callback for each marked element", function () {
        expect(eachCalled).toBe(4);
    });
    it("should call the 'noMatch' callback for not found terms", function () {
        expect(notFound).toEqual(["test"]);
    });
    it("should call the 'done' callback once only", function (done) {
        setTimeout(function () {
            expect(doneCalled).toBe(1);
            done();
        }, 3000);
    });
    it("should call the log function if debug is enabled", function () {
        expect(debugCalled).toBeGreaterThan(0);
    });
    it("should return an object with further methods", function () {
        expect(ret instanceof Mark).toBe(true);
        expect(typeof ret.mark).toBe("function");
        expect(typeof ret.unmark).toBe("function");
        expect(typeof ret.markRegExp).toBe("function");
    });
});
