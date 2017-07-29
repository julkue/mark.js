/*!***************************************************
 * mark.js
 * https://github.com/julmot/mark.js
 * Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 *****************************************************/
"use strict";
describe("mark with regular expression and separateGroups", function () {
    var $ctx1, $ctx2, $ctx3;
    beforeEach(function (done) {
        loadFixtures("regexp/separate-groups.html");

        $ctx1 = $(".regexp-separate-groups > div:nth-child(1)");
        $ctx2 = $(".regexp-separate-groups > div:nth-child(2)");
        $ctx3 = $(".regexp-separate-groups > div:nth-child(3)");
        new Mark($ctx1[0]).markRegExp(/(?:\[%)([a-z_]+):(\w+?)(?:%])/g, {
            separateGroups: true,
            done: function() {
                new Mark($ctx2[0]).markRegExp(/(\w+)-(\w+)/g, {
                    separateGroups: true,
                    done: function() {
                        new Mark($ctx3[0]).markRegExp(/(\w+)-(\w+)/g, {
                            separateGroups: false,
                            done: done
                        });
                    }
                });
            }
        });
    });

    it("should separate groups when enabled", function () {
        expect($ctx1.find("mark")).toHaveLength(6);
        var results = ["test", "value", "testx", "value2", "testz", "123"];
        $ctx1.find("mark").each(function (indx) {
            expect($(this).text()).toBe(results[indx]);
        });
    });
    it("should not separate groups when disabled", function () {
        expect($ctx2.find("mark")).toHaveLength(8);
        var results = [
            "test", "1w",
            "test", "2x",
            "lorem", "3y",
            "ipsum", "4z"
        ];
        $ctx2.find("mark").each(function (indx) {
            expect($(this).text()).toBe(results[indx]);
        });
    });
    it("should not separate groups when disabled", function () {
        expect($ctx3.find("mark")).toHaveLength(4);
    });
});
