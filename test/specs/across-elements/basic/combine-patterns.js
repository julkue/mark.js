'use strict';
describe('combine patterns with acrossElements option', function() {
  var $ctx;
  var words = ['lorem  IPSUM', 'dolor', 'sed', 'sit', 'diam'],
    stats =
      { 'lorem ipsum' : 4, 'dolor' : 4, 'sed' : 4, 'sit' : 4, 'diam' : 4 };

  beforeEach(function() {
    loadFixtures('across-elements/basic/combine-patterns.html');

    $ctx = $('.context');
  });

  it('should mark array with combinePatterns option', function(done) {
    var matchCount = 0;
    new Mark($ctx[0]).mark(words, {
      'separateWordSearch' : false,
      'accuracy' : 'exactly',
      'combinePatterns' : 3,
      'acrossElements' : true,
      'each' : function(elem, info) {
        if (info.matchStart) {
          matchCount++;
        }
      },
      'done' : function(m, totalMatches, termStats) {
        expect(matchCount).toBe(20);
        expect(totalMatches).toBe(20);

        for (var term in termStats) {
          expect(termStats[term]).toBe(stats[term]);
        }
        done();
      }
    });
  });
});
