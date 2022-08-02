'use strict';
describe('combine patterns without acrossElements option', function() {
  var $ctx;
  var words = ['lorem', 'ipsum', 'dolor', 'sed', 'diam'],
    stats = { 'lorem' : 4, 'ipsum' : 4, 'dolor' : 4, 'sed' : 4, 'diam' : 4 };

  beforeEach(function() {
    loadFixtures('basic/combine-patterns.html');

    $ctx = $('.context');
  });

  it('should mark array with combinePatterns option', function(done) {
    new Mark($ctx[0]).mark(words, {
      'combinePatterns' : 3,
      'accuracy' : 'exactly',
      'done' : function(m, totalMatches, termStats) {
        expect(totalMatches).toBe(20);
        expect($ctx.find('mark')).toHaveLength(20);

        for (var term in termStats) {
          expect(termStats[term]).toBe(stats[term]);
        }
        done();
      }
    });
  });
});
