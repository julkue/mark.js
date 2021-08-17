
'use strict';
describe('mark with acrossElements and count words & phrases', function() {
  var $ctx;
  beforeEach(function() {
    loadFixtures('across-elements/basic/count.html');
    
    $ctx = $('.across-elements-count');
  });
  
  it('should correctly count phrases across elements', function(done) {
    var phraseCount = 0;
    
    new Mark($ctx[0]).mark('Lorem ipsum', {
      'diacritics' : false,
      'separateWordSearch' : false,
      'acrossElements' : true,
      each : function(elem, nodeIndex) {
        if (nodeIndex === 0) {
          phraseCount++;
        }
      },
      'done' : function(total) {
        expect(phraseCount).toBe(9);
        expect(total).toBe(15);
        done();
      }
    });
  });
  
  it('should correctly count whole words across elements', function(done) {
    var wordCount = 0;
    new Mark($ctx[0]).mark(['Lorem', 'ipsum'], {
      'diacritics' : false,
      'separateWordSearch' : true,
      'acrossElements' : true,
      'each' : function(elem, nodeIndex) {
        if (nodeIndex === 0) {
          wordCount++;
        }
      },
      'done' : function(total) {
        expect(wordCount).toBe(18);
        expect(total).toBe(21);
        done();
      }
    });
  });
});























