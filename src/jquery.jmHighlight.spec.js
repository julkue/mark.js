/*!***************************************************
 * jmHighlight
 * Copyright (c) 2014–2016, Julian Motz
 * For the full copyright and license information, 
 * please view the LICENSE file that was distributed 
 * with this source code.
 *****************************************************/

// set correct fixture path
jasmine.getFixtures().fixturesPath = "base/test/fixtures";

// load all fixtures and append them to the DOM
jasmine.getFixtures().appendLoad("basic.html");
jasmine.getFixtures().appendLoad("basic-escape.html");
jasmine.getFixtures().appendLoad("basic-separate.html");
jasmine.getFixtures().appendLoad("basic-only-context.html");
jasmine.getFixtures().appendLoad("basic-diacritics.html");
jasmine.getFixtures().appendLoad("basic-synonyms.html");
jasmine.getFixtures().appendLoad("nested.html");

// check environment
describe("environment", function(){
	
	// check if jquery is set
	it("should contain jquery", function(){
		expect(typeof $).toBe("function");
	});
	
});

// check basic highlight
describe("basic highlight", function(){
	
	var instance = $(".basic-test").jmHighlight("lorem ipsum", {
		"element": "span",
		"className": "customHighlight",
		"separateWordSearch": false,
		"diacritics": false
	});
	var $items = $(".basic-test span.customHighlight");
	
	it("should return true", function(){
		expect(instance).toBe(true);
	});
	it("should highlight 4 matches", function(){
		expect($items.length).toBe(4);
	});
	it("should add a data attribute and class to matched elements", function(){
		$items.each(function(){
			var $this = $(this);
			var attr = $this.attr("data-jmHighlight");
			expect(attr).toEqual("true");
			expect($this.hasClass("customHighlight")).toBe(true);
		});
	});
	
});

// check basic highlight removal
describe("basic highlight removal by element and class", function(){
	
	var instance = $(".basic-test").jmRemoveHighlight({
		"element": "span",
		"className": "customHighlight"
	});
	var $container = $(".basic-test");
	var $items = $container.find("span.customHighlight");
	
	it("should return true", function(){
		expect(instance).toBe(true);
	});
	it("should remove all basic highlights", function(){
		expect($items.length).toBe(0);
	});
	it("should replicate the DOM to the original state", function(){
		// all content (including empty nodes from span-tag removal)
		// should be converted into a single node
		var nodes = $container.find("> p")[0].childNodes;
		expect(nodes.length).toBe(1);
	});
	
});

// check highlight escape
describe("highlight escape", function(){
	
	var instance1 = $(".basic-escape > table:nth-child(1)").jmHighlight("39,00 €", {
		"element": "span",
		"className": "customHighlight",
		"separateWordSearch": false
	});
	var $items1 = $(".basic-escape > table:nth-child(1) span.customHighlight");
	var instance2 = $(".basic-escape > table:nth-child(2)").jmHighlight("0.009 €", {
		"element": "span",
		"className": "customHighlight",
		"separateWordSearch": false
	});
	var $items2 = $(".basic-escape > table:nth-child(2) span.customHighlight");
	
	it("should return true", function(){
		expect(instance1).toBe(true);
		expect(instance2).toBe(true);
	});
	it("should highlight 1 match in the first table", function(){
		expect($items1.length).toBe(1);
	});
	it("should highlight 1 match in the second table", function(){
		expect($items2.length).toBe(1);
	});
	it("should not modify text node values when searching with regex characters like '.'", function(){
		expect($items2.first().text()).toBe("0.009 €");
	});
	it("should add a data attribute and class to matched elements", function(){
		$items1.add($items2).each(function(){
			var $this = $(this);
			var attr = $this.attr("data-jmHighlight");
			expect(attr).toEqual("true");
			expect($this.hasClass("customHighlight")).toBe(true);
		});
	});
	
});


// check basic highlight with separate word search
describe("basic highlight with separate word search", function(){
	
	var instance = $(".basic-separate-test").jmHighlight("lorem ipsum", {
		"element": "span",
		"className": "customHighlight",
		"separateWordSearch": true,
		"diacritics": false
	});
	var $items = $(".basic-separate-test span.customHighlight");
	
	it("should return true", function(){
		expect(instance).toBe(true);
	});
	it("should highlight 9 matches", function(){
		expect($items.length).toBe(9);
	});
	it("should add a data attribute and class to matched elements", function(){
		$items.each(function(){
			var $this = $(this);
			var attr = $this.attr("data-jmHighlight");
			expect(attr).toEqual("true");
			expect($this.hasClass("customHighlight")).toBe(true);
		});
	});
	
});

// check basic highlight when searching directly in the context
describe("basic highlight when searching directly in the context", function(){
	
	var instance = $(".basic-only-context-test").jmHighlight("lorem ipsum", {
		"element": "span",
		"className": "customHighlight",
		"separateWordSearch": false,
		"diacritics": false
	});
	var $items = $(".basic-only-context-test span.customHighlight");
	
	it("should return true", function(){
		expect(instance).toBe(true);
	});
	it("should highlight 4 matches", function(){
		expect($items.length).toBe(4);
	});
	it("should add a data attribute and class to matched elements", function(){
		$items.each(function(){
			var $this = $(this);
			var attr = $this.attr("data-jmHighlight");
			expect(attr).toEqual("true");
			expect($this.hasClass("customHighlight")).toBe(true);
		});
	});
	
});

// check basic highlight with diacritics
describe("basic highlight with diacritics", function(){
	
	var instance = $(".basic-diacritics-test").jmHighlight("dolor amet justo", {
		"element": "i",
		"className": "customHighlight",
		"separateWordSearch": true,
		"diacritics": true
	});
	var $items = $(".basic-diacritics-test i.customHighlight");
	
	it("should return true", function(){
		expect(instance).toBe(true);
	});
	it("should highlight 13 matches", function(){
		expect($items.length).toBe(13);
	});
	it("should add a data attribute and class to matched elements", function(){
		$items.each(function(){
			var $this = $(this);
			var attr = $this.attr("data-jmHighlight");
			expect(attr).toEqual("true");
			expect($this.hasClass("customHighlight")).toBe(true);
		});
	});
	
});

// check nested highlight
describe("nested highlight", function(){
	
	var instance = $(".nested-test").jmHighlight("justo", {
		"element": "span",
		"separateWordSearch": false,
		"diacritics": false,
		"filter": [
			".noHighlight",
			".ignore"
		]
	});
	var $container = $(".nested-test");
	var $items = $container.find("span.highlight");
	var $span = $container.find("span.nested-span").find("> span.highlight");
	// Save jquery objects directly here and not in the "it" function block
	// because the DOM will be different. All "it" functions will be called
	// synchronously over all describe blocks, so it would conflict
	// with the highlight removal below this describe block...
	
	it("should return true", function(){
		expect(instance).toBe(true);
	});
	it("should highlight 4 matches", function(){
		expect($items.length).toBe(4);
	});
	it("should add a data attribute and class to matched elements", function(){
		$items.each(function(){
			var $this = $(this);
			var attr = $this.attr("data-jmHighlight");
			expect(attr).toEqual("true");
			expect($this.hasClass("highlight")).toBe(true);
		});
	});
	it("should work also in nested span-elements", function(){
		expect($span.length).toBe(1);
	});
	it("should ignore elements that are included in filters array", function(){
		var $noHighlight = $container.find(".noHighlight");
		var $ignore = $container.find(".ignore");
		expect($noHighlight).not.toContainElement("span.highlight");
		expect($ignore).not.toContainElement("span.highlight");
	});
	
});

// check nested highlight removal by keyword
describe("nested highlight removal by keyword", function(){
	
	var instance = $(".nested-test").jmRemoveHighlight({}, "justo");
	var $container = $(".nested-test");
	var $items = $container.find("span.highlight");
	
	it("should return true", function(){
		expect(instance).toBe(true);
	});
	it("should remove all nested highlights", function(){
		expect($items.length).toBe(0);
	});
	
});

// check synonym highlight
describe("synonym highlight", function(){
	
	// check against normal synonyms in combination with diacritics
	var instance1 = $(".basic-synonyms-test > p:first-child").jmHighlight("lorem ipsum", {
		"element": "span",
		"className": "customHighlight",
		"separateWordSearch": false,
		"diacritics": true,
		"synonyms": {
			"ipsum": "justo"
		}
	});
	// check against numbers and umlauts
	var instance2 = $(".basic-synonyms-test > p:not(:first-child)").jmHighlight("one luefte", {
		"element": "span",
		"className": "customHighlight",
		"separateWordSearch": true,
		"diacritics": true,
		"synonyms": {
			"one": "1",
			"ü": "ue"
		}
	});
	var $items1 = $(".basic-synonyms-test > p:first-child span.customHighlight");
	var $items2 = $(".basic-synonyms-test > p:not(:first-child) span.customHighlight");
	
	it("should return true", function(){
		expect(instance1).toBe(true);
		expect(instance2).toBe(true);
	});
	it("should highlight 4 matches in the first paragraph", function(){
		expect($items1.length).toBe(4);
	});
	it("should highlight 3 matches in the other paragraphs", function(){
		expect($items2.length).toBe(3);
	});
	it("should add a data attribute and class to matched elements", function(){
		$items1.add($items2).each(function(){
			var $this = $(this);
			var attr = $this.attr("data-jmHighlight");
			expect(attr).toEqual("true");
			expect($this.hasClass("customHighlight")).toBe(true);
		});
	});
	
});
