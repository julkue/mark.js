/*!***************************************************
 * jquery.mark
 * https://github.com/julmot/jquery.mark
 * Copyright (c) 2014–2016, Julian Motz
 * Released under the MIT license https://git.io/vaizN
 *****************************************************/
"use strict";
// set correct fixture path
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

console.info("jQuery version " + $.fn.jquery);

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

describe("basic mark removal with elements inside marked elements", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-manipulated-mark.html");

        $ctx = $(".basic-manipulated-mark");
        $ctx.mark("lorem ipsum", {
            "diacritics": false,
            "complete": function () {
                $("<span />", {
                    "html": "test",
                    "id": "manipulatedMark"
                }).appendTo($ctx.find("span.mark").first());
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

    it("should not delete subsequently added elements", function () {
        expect($ctx).toContainElement("#manipulatedMark");
    });
});

describe("basic mark with array", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-array.html");

        $ctx = $(".basic-array");
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

        $ctx = $(".basic-escape");
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

    it("should escape search terms and wrap matches", function () {
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
    it("should not wrap anything inside these tags", function () {
        expect($ctx.find("style, script")).not.toContainElement("span.mark");
    });
});

describe("basic mark directly inside the context", function () {
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

describe("basic mark with multiple same keywords", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-same-keywords.html");

        $ctx = $(".basic-same-keywords");
        $ctx.mark(["test", "test"], {
            "diacritics": false,
            "complete": function () {
                done();
            }
        });
    });
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap only the first occurrence", function () {
        expect($ctx.find("span.mark")).toHaveLength(1);
    });
});

describe("basic mark in an empty context", function () {
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

describe("basic mark with HTML entities", function () {
    var $ctx1, $ctx2;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-entities.html");

        $ctx1 = $(".basic-entities > p:first-child");
        $ctx2 = $(".basic-entities > p:last-child");
        $ctx1.mark("Lorem © ipsum", {
            "diacritics": false,
            "complete": function () {
                $ctx2.mark("justo √ duo", {
                    "diacritics": false,
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

    it("should wrap matches", function () {
        expect($ctx1.find("span.mark")).toHaveLength(1);
        expect($ctx2.find("span.mark")).toHaveLength(1);
    });
});

describe("basic mark with custom element and class", function () {
    var $ctx;
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("basic-custom-element-class.html");

        $ctx = $(".basic-custom-element-class");
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
        jasmine.getFixtures().appendLoad("basic-custom-element-class.html");

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
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes.html");

        $elements = $();
        $ctx = $(".iframes");
        errCall = 0;
        $ctx.mark("lorem", {
            "diacritics": false,
            "iframes": true,
            "each": function ($m) {
                $elements = $elements.add($m);
            },
            "complete": function () {
                done();
            }
        });
    }, 30000); // 30 sec timeout
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches inside iframes", function () {
        var unequal = false;
        $elements.each(function () {
            if($(this).prop("ownerDocument") != $ctx.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(true);
        expect($elements).toHaveLength(8);
        expect(errCall).toBe(0);
    });
});

describe("mark removal with iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes.html");

        $ctx = $(".iframes");
        $elements = $();
        errCall = 0;
        $ctx.mark("lorem", {
            "diacritics": false,
            "iframes": true,
            "each": function ($el) {
                $elements = $elements.add($el);
            },
            "complete": function () {
                $ctx.removeMark({
                    "iframes": true,
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

    it("should remove all marked elements inside iframes", function () {
        $elements.each(function () {
            expect(this).not.toBeInDOM();
        });
        expect(errCall).toBe(0);
    });
});

describe("mark with disabled iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-disabled.html");

        $elements = $();
        $ctx = $(".iframes-disabled");
        errCall = 0;
        $ctx.mark("lorem", {
            "diacritics": false,
            "iframes": false,
            "each": function ($m) {
                $elements = $elements.add($m);
            },
            "complete": function () {
                done();
            }
        });
    }, 30000); // 30 sec timeout
    afterEach(function () {
        $ctx.remove();
    });

    it("should ignore matches inside iframes if specified", function () {
        var unequal = false;
        $elements.each(function () {
            if($(this).prop("ownerDocument") != $ctx.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(false);
        expect($elements).toHaveLength(4);
        expect(errCall).toBe(0);
    });
});

describe("mark in inaccessible iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-inaccessible.html");

        $elements = $();
        $ctx = $(".iframes-inaccessible");
        errCall = 0;
        $ctx.mark("lorem", {
            "diacritics": false,
            "iframes": true,
            "each": function ($m) {
                $elements = $elements.add($m);
            },
            "complete": function () {
                done();
            }
        });
    }, 30000); // 30 sec timeout
    afterEach(function () {
        $ctx.remove();
    });

    it("should silently skip iframes which can not be accessed", function () {
        expect($elements).toHaveLength(4);
        expect(errCall).toBe(0);
    });
});

describe("mark in nested iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-nested.html");

        $elements = $();
        $ctx = $(".iframes-nested");
        errCall = 0;
        $ctx.mark("lorem", {
            "diacritics": false,
            "iframes": true,
            "each": function ($m) {
                $elements = $elements.add($m);
            },
            "complete": function () {
                done();
            }
        });
    }, 30000); // 30 sec timeout
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches inside iframes recursively", function () {
        expect($elements).toHaveLength(12);
        expect(errCall).toBe(0);
    });
});

describe("mark removal with nested iframes", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-nested.html");

        $ctx = $(".iframes-nested");
        $elements = $();
        errCall = 0;
        $ctx.mark("lorem", {
            "diacritics": false,
            "iframes": true,
            "each": function ($el) {
                $elements = $elements.add($el);
            },
            "complete": function () {
                $ctx.removeMark({
                    "iframes": true,
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

    it("should remove all marked elements inside iframes recursively", function () {
        $elements.each(function () {
            expect(this).not.toBeInDOM();
        });
        expect(errCall).toBe(0);
    });
});

describe("mark with iframes where onload was not fired yet", function () {
    // Note that in Chrome the onload event will already be fired. Reason
    // is that Chrome initializes every iframe with an empty page, which will
    // fire the onload event too respectively set readyState complete
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-onload.html");

        $elements = $();
        $ctx = $(".iframes-onload");
        errCall = 0;
        $ctx.mark("test", {
            "diacritics": false,
            "iframes": true,
            "each": function ($m) {
                $elements = $elements.add($m);
            },
            "complete": function () {
                done();
            }
        });
    }, 30000); // 30 sec timeout
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches inside iframes", function () {
        var unequal = false;
        $elements.each(function () {
            if($(this).prop("ownerDocument") != $ctx.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(true);
        expect($elements).toHaveLength(2);
        expect(errCall).toBe(0);
    });
});

describe("mark with iframes where onload was already fired", function () {
    var $ctx, $elements, errCall;
    window.onError = function () {
        errCall++;
    };
    beforeEach(function (done) {
        jasmine.getFixtures().appendLoad("iframes-readystate.html");

        $elements = $();
        $ctx = $(".iframes-readystate");
        errCall = 0;
        var int = setInterval(function () {
            var iCon = $ctx.find("iframe").first()[0].contentWindow;
            var readyState = iCon.document.readyState;
            var href = iCon.location.href;
            // about:blank check is necessary for Chrome (see Mark~onIframeReady)
            if(readyState === "complete" && href !== "about:blank") {
                clearInterval(int);
                $ctx.mark("lorem", {
                    "diacritics": false,
                    "iframes": true,
                    "each": function ($m) {
                        $elements = $elements.add($m);
                    },
                    "complete": function () {
                        done();
                    }
                });
            }
        }, 100);
    }, 30000); // 30 sec timeout
    afterEach(function () {
        $ctx.remove();
    });

    it("should wrap matches inside iframes", function () {
        var unequal = false;
        $elements.each(function () {
            if($(this).prop("ownerDocument") != $ctx.prop("ownerDocument")) {
                unequal = true;
                return;
            }
        });
        expect(unequal).toBe(true);
        expect($elements).toHaveLength(8);
        expect(errCall).toBe(0);
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
