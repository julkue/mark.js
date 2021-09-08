'use strict';
describe('markRegExp with acrossElements and count words&phrases', function() {
  var $ctx;
  beforeEach(function() {
    loadFixtures('across-elements/regexp/count.html');
    
    $ctx = $('.across-elements-count');
  });

  it('should correctly count phrases across elements', function(done) {
    var phraseCount = 0;
    
    new Mark($ctx[0]).markRegExp(/\bLorem\s+ipsum\b/gi, {
      'acrossElements' : true,
      each : function(elem, nodeIndex) {
        if (nodeIndex === 0) {
          phraseCount++;
        }
      },
      'done' : function(total) {
        expect(phraseCount).toBe(25);
        expect(total).toBe(48);
        done();
      }
    });
  });

  it('should correctly count whole words across elements', function(done) {
    var wordCount = 0;
    new Mark($ctx[0]).markRegExp(/\b(?:Lorem|ipsum)\b/gi, {
      'acrossElements' : true,
      'each' : function(elem, nodeIndex) {
        if (nodeIndex === 0) {
          wordCount++;
        }
      },
      'done' : function(total) {
        expect(wordCount).toBe(52);
        expect(total).toBe(55);
        done();
      }
    });
  });
});
