'use strict';
describe('basic mark with done callback', function() {
  var $ctx, doneCalled, totalMatches, totalMarkElements, termStats = {},
    array = ['lorem ipsum', 'dolor sit'];

  beforeEach(function(done) {
    loadFixtures('basic/main.html');

    totalMarkElements = totalMatches = doneCalled = 0;
    $ctx = $('.basic');
    new Mark($ctx[0]).mark(array, {
      'diacritics': false,
      'separateWordSearch': false,
      'done': function(counter, matchCount, stats) {
        doneCalled++;
        totalMarkElements = counter;
        totalMatches = matchCount;
        termStats = stats;
        done();
      }
    });
  });

  it('should call the done callback once only', function(done) {
    setTimeout(function() {
      expect(doneCalled).toBe(1);
      done();
    }, 3000);
  });
  it('should call the done callback with total matches', function() {
    expect(totalMarkElements).toBe(totalMatches);
    expect(totalMatches).toBe(8);

    expect(termStats[array[0]]).toBe(4);
    expect(termStats[array[1]]).toBe(4);
  });
});
