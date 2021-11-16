'use strict';
describe('mark with acrossElements', function() {
  var $ctx;
  beforeEach(function() {
    loadFixtures('across-elements/basic/count.html');

    $ctx = $('.across-elements-count');
  });

  it('should count and test content of whole words', function(done) {
    var wordCount = 0;
    new Mark($ctx[0]).mark(['Lorem', 'ipsum'], {
      'diacritics' : false,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      'each' : function(elem, info) {
        if (info.matchStart) {
          elem.className = 'word-1';
          wordCount++;
        }
      },
      'done' : function() {
        var count = testMarkedText($ctx, 'word-1', /^(?:lorem|ipsum)$/);
        expect(count).toBe(wordCount);
        expect(count).toBe(52);
        done();
      }
    });
  });

  it('should count and test content of phrases', function(done) {
    var phraseCount = 0;

    new Mark($ctx[0]).mark('Lorem ipsum', {
      'diacritics' : false,
      'separateWordSearch' : false,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      each : function(elem, info) {
        if (info.matchStart) {
          // elem in this case is the first marked element of the match
          elem.className = 'phrase-1';
          phraseCount++;
        }
      },
      'done' : function() {
        var count = testMarkedText($ctx, 'phrase-1', /^loremipsum$/);
        expect(count).toBe(phraseCount);
        expect(count).toBe(25);
        done();
      }
    });
  });

  function testMarkedText($ctx, klass, reg) {
    var count = 0,
      marks = $ctx.find('mark');

    marks.filter(function() {
      return $(this).hasClass(klass);

    }).each(function() {
      expect(getMarkedText($(this), marks)).toMatch(reg);
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
        if (el === elem[0]) {
          found = true;
        }

      } else if (el.className && /\b[a-z]+-1\b/.test(el.className)) {
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
