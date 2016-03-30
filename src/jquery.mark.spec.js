/*!***************************************************
 * jquery.mark
 * https://github.com/julmot/jquery.mark
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vaizN
 *****************************************************/
"use strict";
// set correct fixture path
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

describe("environment", function () {
    it("should contain jquery", function () {
        expect(typeof $).toBe("function");
    });
});

describe("basic mark", function () {
    var $ctx, eachCalled, completeCalled, debugCalled;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        eachCalled = completeCalled = debugCalled = 0;
        $ctx = $(".basic");
        $ctx.mark("lorem ipsum", {
            "diacritics": false,
            "each": function () {
                eachCalled++;
            },
            "complete": function () {
                completeCalled++;
                done();
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
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("span.mark")).toHaveLength(4);
    });
    it("should call the 'each' callback for each marked element", function () {
        expect(eachCalled).toBe(4);
    });
    it("should call the 'complete' callback once only", function (done) {
        setTimeout(function () {
            expect(completeCalled).toBe(1);
            done();
        }, 3000);
    });
    it("should call the log function if debug is enabled", function () {
        expect(debugCalled).toBeGreaterThan(0);
    });
});

describe("basic mark removal", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        $ctx = $(".basic");
        $ctx.mark("lorem ipsum", {
            "diacritics": false,
            "complete": function () {
                $ctx.removeMark({
                    "complete": function () {
                        done();
                    }
                });
            }
        });

    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should remove all marked elements", function () {
        expect($ctx).not.toContainElement("span.mark");
    });
    it("should restore the DOM to the original state", function () {
        // all text nodes (including empty nodes from span-tag removal)
        // should be converted into a single node
        var nodes = $ctx.find("> p")[0].childNodes;
        expect(nodes.length).toBe(1);
    });
});

describe("basic mark with array", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        $ctx = $(".basic");
        $ctx.mark(["lorem", "ipsum"], {
            "diacritics": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap all matching keywords from the array", function () {
        expect($ctx.find("span.mark")).toHaveLength(8);
    });
});

describe("basic mark with regex characters", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-escape.html");

        $ctx = $(".basic-escape > table");
        $ctx.mark(["39,00 €", "0.009 €", "Unk?nown", "Some+>thing"], {
            "diacritics": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("span.mark")).toHaveLength(4);
    });
    it("should not modify text node values", function () {
        expect($ctx.find("span.mark").get(0)).toContainText("39,00 €");
        expect($ctx.find("span.mark").get(1)).toContainText("0.009 €");
        expect($ctx.find("span.mark").get(2)).toContainText("Unk?nown");
        expect($ctx.find("span.mark").get(3)).toContainText("Some+>thing");
    });
});

describe("basic mark in a context with script-tags and style-tags", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-script-style.html");

        $ctx = $(".basic-script-style");
        $ctx.mark("lorem", {
            "diacritics": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("span.mark")).toHaveLength(4);
    });
    it("should not wrap anything inside script-tags or style-tags", function () {
        expect($ctx.find("style, script")).not.toContainElement("span.mark");
    });
});

describe("basic mark directly inside context", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-only-context.html");

        $ctx = $(".basic-only-context");
        $ctx.mark("lorem ipsum", {
            "diacritics": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("span.mark")).toHaveLength(4);
    });
});

describe("basic mark with empty context", function () {
    var $ctx1, $ctx2, complete1 = false,
        complete2 = false;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-empty.html");

        $ctx1 = $(".notExistingSelector")
        $ctx2 = $(".basic-empty");
        $ctx1.mark("lorem", {
            "diacritics": false,
            "complete": function () {
                complete1 = true;
                $ctx2.mark("lorem", {
                    "diacritics": false,
                    "complete": function () {
                        complete2 = true;
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).remove();
    });

    it("should call the complete function", function () {
        expect(complete1).toBe(true);
        expect(complete2).toBe(true);
    });
});

describe("basic mark with custom element and class", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        $ctx = $(".basic");
        $ctx.mark(["lorem", "ipsum"], {
            "diacritics": false,
            "element": "i",
            "className": "custom",
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches with specified element and class", function () {
        expect($ctx.find("i.custom")).toHaveLength(8);
    });
});

describe("basic mark removal with custom element and class", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic.html");

        $ctx = $(".basic");
        $ctx.mark(["lorem", "ipsum"], {
            "diacritics": false,
            "element": "i",
            "className": "custom",
            "complete": function () {
                $ctx.removeMark({
                    "element": "i",
                    "className": "custom",
                    "complete": function () {
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should remove all marked elements", function () {
        expect($ctx).not.toContainElement("span.mark");
    });
});

describe("basic mark with filter", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-filter.html");

        $ctx = $(".basic-filter");
        $ctx.mark("lorem ipsum", {
            "diacritics": false,
            "filter": [
                "*[data-ignore]",
                ".ignore"
            ],
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should exclude matches that are inside a filter selector", function () {
        expect($ctx.find("span.mark")).toHaveLength(4);
    });
});

describe("basic mark with separate word search", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-separate.html");

        $ctx1 = $(".basic-separate > p:first-child");
        $ctx2 = $(".basic-separate > p:last-child");
        $ctx1.mark("lorem ipsum", {
            "diacritics": false,
            "separateWordSearch": true,
            "complete": function () {
                $ctx2.mark(["lorem ipsum"], {
                    "diacritics": false,
                    "separateWordSearch": true,
                    "complete": function () {
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).remove();
    });

    it("should wrap separated words", function () {
        expect($ctx1.find("span.mark")).toHaveLength(8);
        expect($ctx2.find("span.mark")).toHaveLength(8);
    });
});

describe("basic mark with separateWordSearch and blanks", function () {
    var $ctx1, $ctx2, $ctx3;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-separate-blank.html");

        $ctx1 = $(".basic-separate-blank > p:nth-child(1)");
        $ctx2 = $(".basic-separate-blank > p:nth-child(2)");
        $ctx3 = $(".basic-separate-blank > p:nth-child(3)");
        $ctx1.mark("lorem ", {
            "diacritics": false,
            "separateWordSearch": true,
            "complete": function () {
                $ctx2.mark(" lorem ", {
                    "diacritics": false,
                    "separateWordSearch": true,
                    "complete": function () {
                        $ctx3.mark([""], {
                            "diacritics": false,
                            "separateWordSearch": true,
                            "complete": function () {
                                done();
                            }
                        });
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).add($ctx3).remove();
    });

    it("should wrap matches, ignore blanks and call complete", function () {
        expect($ctx1.find("span.mark")).toHaveLength(4);
        expect($ctx2.find("span.mark")).toHaveLength(4);
        expect($ctx3.find("span.mark")).toHaveLength(0);
    });
});

describe("basic mark with diacritics", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-diacritics.html");

        $ctx = $(".basic-diacritics");
        $ctx.mark("dolor amet justo", {
            "separateWordSearch": true,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should treat normal and diacritic characters equally", function () {
        expect($ctx.find("span.mark")).toHaveLength(13);
    });
});

describe("basic mark with synonyms", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-synonyms.html");

        $ctx1 = $(".basic-synonyms > p:first-child");
        $ctx2 = $(".basic-synonyms > p:not(:first-child)");
        $ctx1.mark("lorem", {
            "synonyms": {
                "lorem": "ipsum"
            },
            "complete": function () {
                $ctx2.mark(["one", "2", "lüfte"], {
                    "synonyms": {
                        "ü": "ue",
                        "one": "1",
                        "two": "2"
                    },
                    "complete": function () {
                        done();
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).remove();
    });

    it("should wrap synonyms as well as keywords", function () {
        expect($ctx1.find("span.mark")).toHaveLength(8);
        expect($ctx2.find("span.mark")).toHaveLength(4);
    });
});

describe("basic mark with word boundary", function () {
    var $ctx1, $ctx2, $ctx3;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-word-boundary.html");

        $ctx1 = $(".basic-word-boundary > p:nth-child(1)");
        $ctx2 = $(".basic-word-boundary > p:nth-child(2)");
        $ctx3 = $(".basic-word-boundary > p:nth-child(3)");
        $ctx1.mark("lore", {
            "wordBoundary": true,
            "complete": function () {
                $ctx2.mark("lorem ipsum", {
                    "wordBoundary": true,
                    "complete": function () {
                        $ctx3.mark("lorem ipsum dolo", {
                            "wordBoundary": true,
                            "separateWordSearch": true,
                            "complete": function () {
                                done();
                            }
                        });
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).add($ctx3).remove();
    });

    it("should only wrap matches with a word boundary", function () {
        expect($ctx1.find("span.mark")).toHaveLength(0);
        expect($ctx2.find("span.mark")).toHaveLength(4);
    });
    it("should work with separateWordSearch", function () {
        expect($ctx3.find("span.mark")).toHaveLength(8);
    });
});

describe("nested mark", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("nested.html");

        $ctx = $(".nested");
        $ctx.mark("lorem", {
            "diacritics": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("span.mark")).toHaveLength(7);
    });
    it("should also wrap matches in nested span elements", function () {
        expect($ctx.find(".nested-span > span.mark")).toHaveLength(1);
    });
});

describe("nested mark removal", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("nested.html");

        $ctx = $(".nested");
        $ctx.mark("lorem", {
            "diacritics": false,
            "complete": function () {
                $ctx.removeMark({
                    "complete": function () {
                        done();
                    }
                });
            }
        });

    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should remove all marked elements", function () {
        expect($ctx).not.toContainElement("span.mark");
    });
    it("should restore the DOM to the original state", function () {
        var nodes1 = $ctx.find("> p")[0].childNodes;
        var nodes2 = $ctx.find("> div > p")[0].childNodes;
        var nodes3 = $ctx.find(".nested-span")[0].childNodes;
        expect(nodes1.length).toBe(3);
        expect(nodes2.length).toBe(3);
        expect(nodes3.length).toBe(1);
    });
});

describe("mark with iframes", function () {
    var $ctx1, $ctx2, $ctx3, $ctx4;
    var $elements1, $elements2, $elements3, $elements4;
    var errCall = 0;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes.html");

        $elements1 = $(), $elements2 = $(), $elements3 = $(), $elements4 = $();
        errCall = 0;
        $ctx1 = $(".iframes > .context1");
        $ctx2 = $(".iframes > .context2");
        $ctx3 = $(".iframes > .context3");
        $ctx4 = $(".iframes > .context4");
        $ctx1.mark("lorem", {
            "diacritics": false,
            "iframes": false,
            "each": function ($el) {
                $elements1 = $elements1.add($el);
            },
            "complete": function () {
                $ctx2.mark("lorem", {
                    "diacritics": false,
                    "iframes": true,
                    "each": function ($el) {
                        $elements2 = $elements2.add($el);
                    },
                    "complete": function () {
                        $ctx3.mark("lorem", {
                            "diacritics": false,
                            "iframes": true,
                            "each": function ($el) {
                                $elements3 = $elements3.add($el);
                            },
                            "complete": function () {
                                $ctx4.mark("lorem", {
                                    "diacritics": false,
                                    "iframes": true,
                                    "each": function ($el) {
                                        $elements4 =
                                            $elements4.add(
                                                $el);
                                    },
                                    "complete": function () {
                                        done();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    afterEach(function () {
        $ctx1.add($ctx2).add($ctx3).add($ctx4).remove();
    });

    it("should ignore matches inside iframes if specified", function () {
        expect($elements1).toHaveLength(4);
        var unequal = false;
        $elements1.each(function () {
            if($(this).prop("ownerDocument") != $ctx1.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(false);
        expect(errCall).toBe(0);
    });
    it("should wrap matches inside iframes if specified", function () {
        expect($elements2).toHaveLength(8);
        var unequal = false;
        $elements2.each(function () {
            if($(this).prop("ownerDocument") != $ctx2.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(true);
        expect(errCall).toBe(0);
    });
    it("should silently skip iframes which can not be accessed", function () {
        expect($elements3).toHaveLength(4);
        expect(errCall).toBe(0);
    });
    it("should wrap matches inside iframes recursively", function () {
        expect($elements4).toHaveLength(12);
        expect(errCall).toBe(0);
    });
});

describe("mark removal with iframes", function () {
    var $ctx, $elements;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes.html");

        $ctx = $(".iframes > .context4");
        $elements = $();
        $ctx.mark("lorem", {
            "diacritics": false,
            "iframes": true,
            "each": function ($el) {
                $elements = $elements.add($el);
            },
            "complete": function () {
                $ctx.removeMark({
                    "complete": function () {
                        $ctx.removeMark({
                            "iframes": true,
                            "complete": function () {
                                done();
                            }
                        });
                    }
                });
            }
        });

    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should remove all marked elements recursively", function () {
        $elements.each(function () {
            expect(this).not.toBeInDOM();
        });
    });
});

describe("mark with regular expression", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("regexp.html");

        $ctx = $(".regexp");
        $ctx.markRegExp(/Lor[^]?m/gmi, {
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches", function () {
        expect($ctx.find("span.mark")).toHaveLength(4);
    });
});
