'use strict';
describe('mark with acrossElements and count words & phrases', function() {
  var $ctx;
  beforeEach(function() {
    loadFixtures('across-elements/basic/count.html');
    
    $ctx = $('.across-elements-count');
  });

  it('should correctly count whole words across elements', function(done) {
    var wordCount = 0;
    new Mark($ctx[0]).mark(['Lorem', 'ipsum'], {
      'diacritics' : false,
      'separateWordSearch' : true,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      'each' : function(elem, nodeIndex) {
        if (nodeIndex === 0) {
          elem.className = 'word-1';
          wordCount++;
        }
      },
      'done' : function(total) {
        expect($ctx.find('mark.word-1')).toHaveLength(wordCount);
        expect(wordCount).toBe(52);
        expect($ctx.find('mark')).toHaveLength(total);
        done();
      }
    });
  });
  
  it('should correctly count phrases across elements', function(done) {
    var phraseCount = 0;
    
    new Mark($ctx[0]).mark('Lorem ipsum', {
      'diacritics' : false,
      'separateWordSearch' : false,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      each : function(elem, nodeIndex) {
        if (nodeIndex === 0) {
          elem.className = 'phrase-1';
          phraseCount++;
        }
      },
      'done' : function(total) {
        expect($ctx.find('mark.phrase-1')).toHaveLength(phraseCount);
        expect(phraseCount).toBe(25);
        expect($ctx.find('mark')).toHaveLength(total);
        done();
      }
    });
  });
});
