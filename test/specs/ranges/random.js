'use strict';
describe('Test random generated ranges', function() {
  var $ctx, ranges;

  beforeEach(function() {
    loadFixtures('ranges/main.html');
    $ctx = $('.ranges');
    ranges = [];
    
    var start, length;
    
    for (var i = 0; i < 255; i++) {
      if (i > 32 && (i % 10) === 0) {
        start = String.fromCharCode(i);
        length = String.fromCharCode(i);
        
      } else {
        start = Math.floor((Math.random() * 1200) + 1);
        length = Math.floor((Math.random() * 15) + 1);
      } 
      ranges.push({ start: start, length: length });
    }
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
