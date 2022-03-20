'use strict';
// This test only make sense with unclamp `s` variable in the
// wrapRangeInMappedTextNode method
describe('Test random generated ranges', function() {
  var $ctx, ranges;

  beforeEach(function() {
    loadFixtures('ranges/main.html');
    $ctx = $('.ranges');
    ranges = [];
    
    var start, length;
    
    for (var i = 0; i < 200; i++) {
      if (i > 32 && (i % 10) === 0) {
        start = String.fromCharCode(232 - i);
        length = String.fromCharCode(i);
        
      } else {
        // start varied from -100 to 2000 (grater than size of the context)
        start = Math.floor((Math.random() * 2000) - 100);
        length = Math.floor((Math.random() * 15) - 1);
      } 
      ranges.push({ start: start, length: length });
    }
    ranges.push({ start: null, length: null });
    ranges.push({ length: 15 });
    ranges.push({ start: 15 });
  });

  it('should not throws the DOM exception', function(done) {
    new Mark($ctx[0]).markRanges(ranges, {
      'done' : function(totalMarks) {
        expect(totalMarks).toBeGreaterThan(0);
        done();
      }
    });
  });
});
