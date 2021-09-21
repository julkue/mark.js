'use strict';
describe('markRegExp with acrossElements and count words&phrases', function() {
  var $ctx;
  beforeEach(function() {
    loadFixtures('across-elements/regexp/count.html');

    $ctx = $('.across-elements-count');
  });

  // just for code coverage
  it('should recompile RegExp which is without g or y flags', function(done) {
    var reg = /\w+/im;
    new Mark($ctx[0]).markRegExp(reg, {
      'acrossElements' : true,
      'done' : function() {
        expect($ctx.find('mark').length).toBeGreaterThan(50);
        done();
      }
    });
  });

  it('should count and test content of whole words', function(done) {
    var wordCount = 0;

    new Mark($ctx[0]).markRegExp(/\b(?:Lorem|ipsum)\b/gi, {
      'acrossElements' : true,
      'each' : function(elem, info) {
        if (info.matchStart) {
          elem.className = 'start-1';
          wordCount++;
        }
      },
      'done' : function() {
        var count = testMarkedText($ctx, /^(?:lorem|ipsum)$/);
        expect(count).toBe(wordCount);
        expect(count).toBe(52);
        done();
      }
    });
  });

  it('should count and test content of filtered matches', function(done) {
    var matchCount = 0;

    new Mark($ctx[0]).markRegExp(/(\best\s+)?\bLorem\s+ipsum\b/gi, {
      'acrossElements' : true,
      filter : function(node, group, total, obj) {
        // skip unwanted matches
        if (obj.match[1]) {
          return  false;
        }
        return true;
      },
      'each' : function(elem, info) {
        // if match started
        if (info.matchStart) {
          // elem in this case is the first marked element of the match
          elem.className = 'start-1';
          matchCount++;
        }
      },
      'done' : function() {
        var count = testMarkedText($ctx, /^loremipsum$/);
        expect(count).toBe(matchCount);
        expect(count).toBe(22);
        done();
      }
    });
  });

  function testMarkedText($ctx, reg) {
    var count = 0,
      marks = $ctx.find('mark');

    marks.filter(function(i, el) {
      return el.hasAttribute('class');

    }).each(function(i, elem) {
      expect(getMarkedText(elem, marks)).toMatch(reg);
      count++;
    });
    return count;
  }

  // it aggregate match text across elements
  function getMarkedText(elem, marks) {
    var text = '',
      found = false;
    marks.each(function(i, el) {
      if ( !found) {
        if (el === elem) {
          found = true;
        }

      } else if (el.hasAttribute('class')) {
        return  false;
      }
      if (found) {
        text += el.textContent;
      }
      return true;
    });
    // the text, aggregated without taking into account html elements,
    // requires some normalization
    return  text.replace(/\s+/g, '').toLowerCase();
  }
});
