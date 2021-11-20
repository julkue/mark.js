'use strict';
describe('markRegExp with acrossElements and block boundary', function() {
  var $ctx,
    message = 'should count and test content ';

  beforeEach(function() {
    loadFixtures('across-elements/regexp/block-elements-boundary.html');

    $ctx = $('.block-elements-boundary');
  });

  it(message + 'of phrases with blockElementsBoundary', function(done) {
    var matchCount = 0;

    new Mark($ctx[0]).markRegExp(/\bblock\s+elements\s+boundary\b/gi, {
      'acrossElements' : true,
      'blockElementsBoundary' : true,
      'each' : function(elem, info) {
        if (info.matchStart) {
          elem.className = 'start-1';
          matchCount++;
        }
      },
      'done' : function() {
        var count = testMarkedText($ctx, /^blockelementsboundary$/);
        expect(count).toBe(matchCount);
        expect(count).toBe(2);
        done();
      }
    });
  });

  it(message + 'of phrases with custom blockElements', function(done) {
    var matchCount = 0;

    new Mark($ctx[0]).markRegExp(/\bblock\s+elements\s+boundary\b/gi, {
      'acrossElements' : true,
      'blockElementsBoundary' : true,
      'blockElements' : ['Div', 'p', 'H1', 'h2'],
      'boundaryChar' : '|',
      'each' : function(elem, info) {
        if (info.matchStart) {
          elem.className = 'start-1';
          matchCount++;
        }
      },
      'done' : function() {
        var count = testMarkedText($ctx, /^blockelementsboundary$/);
        expect(count).toBe(matchCount);
        expect(count).toBe(3);
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
    return  text.replace(/\s+/g, '').toLowerCase();
  }
});
