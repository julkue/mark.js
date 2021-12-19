'use strict';
describe('mark with acrossElements and block elements boundary', function() {
  var $ctx,
    message = 'should count and test content ';

  beforeEach(function() {
    loadFixtures('across-elements/basic/block-elements-boundary.html');

    $ctx = $('.block-elements-boundary');
  });

  it(message + 'of phrases with blockElementsBoundary', function(done) {
    var phraseCount = 0;

    new Mark($ctx[0]).mark('block elements boundary', {
      'diacritics' : false,
      'separateWordSearch' : false,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      'blockElementsBoundary' : {},
      each : function(elem, info) {
        if (info.matchStart) {
          // elem in this case is the first marked element of the match
          elem.className = 'phrase-1';
          phraseCount++;
        }
      },
      'done' : function() {
        var count = testMarkedText($ctx, /^blockelementsboundary$/);
        expect(count).toBe(phraseCount);
        expect(count).toBe(2);
        done();
      }
    });
  });

  it(message + 'of phrases with custom blockElements', function(done) {
    var phraseCount = 0;

    new Mark($ctx[0]).mark('block elements boundary', {
      'diacritics' : false,
      'separateWordSearch' : false,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      'blockElementsBoundary' : {
        tagNames : ['Div', 'p', 'H1', 'h2'],
      },
      each : function(elem, info) {
        if (info.matchStart) {
          // elem in this case is the first marked element of the match
          elem.className = 'phrase-1';
          phraseCount++;
        }
      },
      'done' : function() {
        var count = testMarkedText($ctx, /^blockelementsboundary$/);
        expect(count).toBe(phraseCount);
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
