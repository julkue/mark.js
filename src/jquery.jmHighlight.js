/*!***************************************************
 * jmHighlight
 * Version 3.1.3
 * Copyright (c) 2014–2016, Julian Motz
 * For the full copyright and license information, 
 * please view the LICENSE file that was distributed 
 * with this source code.
 *****************************************************/
(function (global, factory){
	"use strict";
	if(typeof define === "function" && define.amd){
		// RequireJS. Register as an anonymous module.
		define(["jquery"], function(jQuery, global){
			return factory(jQuery, global);
		});
	} else if (typeof exports === "object"){
		// Node/CommonJS
		factory(require("jquery"), global);
	} else {
		// No dependency management
		factory(global.jQuery, global);
	}
})(this, function (jQuery, global_){
	"use strict";
	
	/**
	 * Map jQuery
	 */
	var $ = jQuery;
	
	/**
	 * Instance initialization
	 * Note: It is only possible to highlight or
	 * remove highlight once per instance because the
	 * initialization of elements will be done on start
	 * only. Changes through element manipulation will not
	 * be detected.
	 * If the keyword or context is empty no error will be
	 * thrown. The user doesn't expect that anything happens.
	 * 
	 * @param jquery-object $context_
	 * @param string keyword_
	 * @param object options_
	 * @returns this
	 */
	function jmHighlight($context_, keyword_, options_){
		// Initialize options
		this.options = $.extend({}, {
			"debug": false,
			"log": global_.console,
			"element": "span",
			"className": "highlight",
			"filter": [],
			"separateWordSearch": false,
			"diacritics": true,
			"synonyms": {}
		}, options_);
		
		// Initialize keyword
		this.keyword = typeof keyword_ === "string" ? this.escapeStr(keyword_): "";
		
		// Initialize elements
		this.$elements = $();
		if($context_ instanceof $ && $context_.length > 0 && !$context_.is($("html"))){
			// Search in context itself and in children
			this.$elements = $context_.add($context_.find("*"));
			// Filter elements if filter is defined
			this.filterElements();
		}
		return this;
	}
	
	/**
	 * Diacritics for multilingual usage 
	 */
	jmHighlight.prototype.diacritics = [
		"aÀÁÂÃÄÅàáâãäåĀāąĄ",
		"cÇçćĆčČ",
		"dđĐďĎ",
		"eÈÉÊËèéêëěĚĒēęĘ",
		"iÌÍÎÏìíîïĪī",
		"lłŁ",
		"nÑñňŇńŃ",
		"oÒÓÔÕÕÖØòóôõöøŌō",
		"rřŘ",
		"sŠšśŚ",
		"tťŤ",
		"uÙÚÛÜùúûüůŮŪū",
		"yŸÿýÝ",
		"zŽžżŻźŹ"
	];
	
	/**
	 * Escapes a string for regex usage
	 * 
	 * @param string str_
	 * @returns string
	 */
	jmHighlight.prototype.escapeStr = function(str_){
		return str_.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	};
	
	/**
	 * Log
	 * 
	 * @param mixed param_
	 * @param string level_
	 * @return void
	 */
	jmHighlight.prototype.log = function(param_, level_){
		if(typeof level_ !== "string"){
			level_ = "debug";
		}
		if(typeof param_ === "string" && this.options["debug"]){
			this.options["log"][level_]("jmHighlight: " + param_);
		}
		if(typeof param_ === "object" && this.options["debug"]){
			this.options["log"][level_]("jmHighlight: ", param_);
		}
	};
	
	/**
	 * Filters elements by specified filter
	 * and script and style tags
	 * 
	 * @returns void
	 */
	jmHighlight.prototype.filterElements = function(){
		var filterArr = this.options["filter"];
		if(
			typeof filterArr !== "object" ||
			Object.prototype.toString.call(filterArr) !== "[object Array]" ||
			this.$elements instanceof $ === false
		){
			return;
		}
		this.$elements = this.$elements.filter(function(){
			// Check if a filter matches this element
			for(var i = 0, ilength = filterArr.length; i < ilength; i++){
				// Use is() instead of hasClass() to
				// support complex selectors
				if($(this).is(filterArr[i])){
					// Delete entry
					return false;
				}
			}
			// Remain entry
			return true;
		}).filter(":not(script):not(style)");
	};
	
	/**
	 * Creates an regular expression (string)
	 * to match a keyword
	 * 
	 * @param string keyword_ (optional if you don't want to use this.keyword)
	 * @returns string
	 */
	jmHighlight.prototype.getKeywordRegexp = function(keyword_){
		var keyword = typeof keyword_ !== "string" ? this.keyword: keyword_;
		if(typeof keyword !== "string" || keyword === ""){
			return keyword;
		}
		var regexString = keyword;
		if(
			typeof this.options["synonyms"] === "object" &&
			!$.isEmptyObject(this.options["synonyms"])
		){
			regexString = this.getSynonymsRegex(regexString);
		}
		if(
			typeof this.options["diacritics"] === "boolean" &&
			this.options["diacritics"]
		){
			regexString = this.getDiacriticsRegex(regexString);
		}
		return regexString;
	};
	
	/**
	 * Creates an regular expression (string)
	 * to match synonyms
	 * 
	 * @param string str_
	 * @returns string
	 */
	jmHighlight.prototype.getSynonymsRegex = function(str_){
		var regexp = str_;
		if(typeof regexp !== "string"){
			return regexp;
		}
		var that = this;
		$.each(this.options["synonyms"], function(index, value){
			var search = that.escapeStr(index);
			var synonym = that.escapeStr(value);
			regexp = regexp.replace(
				new RegExp("(" + search + "|" + synonym + ")", "gmi"),
				"(" + search + "|" + synonym + ")"
			);
		});
		return regexp;
	};
	
	/**
	 * Creates an regular expression (string)
	 * to match diacritics
	 * 
	 * @param string str_
	 * @returns string
	 */
	jmHighlight.prototype.getDiacriticsRegex = function(str_){
		var regexp = str_;
		if(typeof regexp !== "string"){
			return regexp;
		}
		var charArr = regexp.split('');
		var handled = [];
		for(var k = 0, klength = charArr.length; k < klength; k++){
			var ch = charArr[k];
			for(var j = 0, jlength = this.diacritics.length; j < jlength; j++){
				var diacritic = this.diacritics[j];
				if(diacritic.indexOf(ch) !== -1){
					if(handled.indexOf(diacritic) > -1){// check if already handled
						continue;
					}
					// Match found. Now replace all
					// characters in this diacritic-list
					// with the regular expression
					// (since all characters in that list will not get
					// handled anymore)
					regexp = regexp.replace(
						new RegExp("[" + diacritic + "]", "gmi"),
						"[" + diacritic + "]"
					);
					handled.push(diacritic);
				}
			}
		}
		return regexp;
	};
	
	/**
	 * Searches for a keyword in element text nodes
	 * and replaces matches with an HTML highlight element
	 * 
	 * @param string keyword_ (optional, will be used for separateWordSearch)
	 * @returns bool
	 */
	jmHighlight.prototype.highlight = function(keyword_){
		// Allow overwriting the keyword to allow separate word search
		var keyword = typeof keyword_ !== "string" ? this.keyword: keyword_;
		// If the keyword is a blank then it is not an error because
		// the user does not expect that anything will be highlighted.
		// So we will still return true
		if(keyword === ""){
			return true;
		}
		if(this.$elements.length === 0){
			this.log("No search context provided", "warn");
			return false;
		}
		
		// If there are multiple keywords and separate word search
		// is configured then highlight them all separately
		var sepWS = this.options["separateWordSearch"];
		var spl = keyword.split(" ");
		if(typeof sepWS === "boolean" && sepWS && spl.length > 1){
			for(var j = 0, jlength = spl.length; j < jlength; j++){
				// Call the highlighting function for each
				// separate keyword
				if(!this.highlight(spl[j])){
					return false;
				}
			}
			return true;
		}
		
		// Filter all elements that were already highlighted
		// (e.g. if separateWordSearch is true)
		this.$elements = this.$elements.filter("*:not([data-jmHighlight])");
		
		var regexp = this.getKeywordRegexp(keyword);
		var regex = new RegExp(regexp, "gmi");
		var highlightElement = this.options["element"];
		var highlightClass = this.options["className"];
		this.log(
			"Highlighting keyword '" + keyword + "' with regex '" +
			regexp + "' in elements:"
		);
		this.log(this.$elements);
		this.$elements.contents().filter(function(){
			return this.nodeType == 3 && this.textContent.trim() !== "";
		}).each(function(){
			// The DOM reference of this will get lost due to splitText.
			// Therefore we need to save the new created element in "node"
			var node = this, match, startNode;
			while((match = regex.exec(node.textContent)) !== null){
				// Split the text node and
				// replace match with highlight element
				startNode = node.splitText(match.index);
				node = startNode.splitText(match[0].length);
				regex.lastIndex = 0; // http://tinyurl.com/htsudjd
				$(startNode).replaceWith($("<" + highlightElement + " />", {
					"class": highlightClass,
					"data-jmHighlight": true,
					"text": match[0]
				}));
			}
		});
		return true;
	};
	
	/**
	 * Highlight removal
	 * 
	 * @returns bool
	 */
	jmHighlight.prototype.removeHighlight = function(){
		if(this.$elements.length === 0){
			this.log("No search context provided", "warn");
			return false;
		}
		if(typeof this.keyword === "string" && this.keyword !== ""){
			this.log("Removing highlighting with keyword: '" + this.keyword + "'");
		} else {
			this.log("Removing highlighting");
		}
		var regex = new RegExp(this.getKeywordRegexp(), "mi");
		var find = this.options["element"] + "[data-jmHighlight]." + this.options["className"];
		var parentScope = this;
		var $stack = this.$elements.filter(find);
		this.log(find);
		this.log($stack);
		$stack.each(function(){
			var $this = $(this);
			if(!regex.test($this.text())){
				return true;
			} else {
				// Remove element with this text
				// @notice: When removing the HTML node
				// with just the text, it will remain a separate
				// text node for the replaced text. Because
				// the highlighting finds only text nodes
				// with the whole keyword inside, we need
				// to append the next text node with the text. This will
				// avoid having separate text nodes.
				parentScope.appendTextNodes($this, $stack);
			}
		});
		return true;
	};
	
	/**
	 * Will append the domElement with previous
	 * or next elements if they are text nodes
	 * or also highlighting elements. This prevents
	 * that the highlight removal will split text nodes.
	 * 
	 * @param jquery-object $domElement
	 * @param jquery-object $stack
	 * @returns bool
	 */
	jmHighlight.prototype.appendTextNodes = function($domElement, $stack){
		if($domElement instanceof $ === false || $domElement.length === 0){
			return false;
		}
		
		var domElement = $domElement.first()[0];
		var prevSibling = domElement.previousSibling;
		var nextSibling = domElement.nextSibling;
		var $prevSibling = $(prevSibling);
		var $nextSibling = $(nextSibling);
		
		var handled = false;
		// Check if there is a previous text node or
		// highlight element. If so, append those two elements
		// with the text content
		if($prevSibling.length > 0){
			if(prevSibling.nodeType === 3){
				// It's a text node
				prevSibling.nodeValue = prevSibling.nodeValue + $domElement.text();
				$domElement.remove();
			} else if($stack instanceof $ && $stack.length > 0 && $stack.is($prevSibling)){
				// It's another highlighting element
				$prevSibling.replaceWith($domElement.text() + $prevSibling.text());
				$domElement.remove();
			} else {
				$domElement.replaceWith($domElement.text());
			}
			handled = true;
		}
		
		// Check if there is a next text node or
		// highlight element. If so, append those two elements
		// with the text node
		if($nextSibling.length > 0){
			if(nextSibling.nodeType === 3){
				if($prevSibling.length === 0){
					nextSibling.nodeValue = $domElement.text() + nextSibling.nodeValue;
					$domElement.remove();
				} else {
					nextSibling.nodeValue = $prevSibling.text() + nextSibling.nodeValue;
					$prevSibling.remove();
				}
			} else if($stack instanceof $ && $stack.length > 0 && $stack.is($nextSibling)){
				if($prevSibling.length === 0){
					$nextSibling.replaceWith($nextSibling.text() + $domElement.text());
					$domElement.remove();
				} else {
					$nextSibling.replaceWith($prevSibling.text() + $nextSibling.text());
					$prevSibling.remove();
				}
			} else {
				if($prevSibling.length === 0){
					$domElement.replaceWith($domElement.text());
				}
			}
			handled = true;
		}
		
		// If there is no next or prev element
		// simply remove the element with it's content
		if(handled === false){
			$domElement.replaceWith($domElement.text());
		}
		
		return true;
	};
		
	/**
	 * jmHighlight component exposure for jQuery
	 * 
	 * @param string keyword_
	 * @param object options_
	 * @returns boolean
	 */
	$.fn.jmHighlight = function(keyword_, options_){
		var highlightInstance = new jmHighlight($(this), keyword_, options_);
		return highlightInstance.highlight();
	};
	$.fn.jmRemoveHighlight = function(options_, keyword_){
		var highlightInstance = new jmHighlight($(this), keyword_, options_);
		return highlightInstance.removeHighlight();
	};
	
});