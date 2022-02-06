'use strict';
describe('mark with acrossElements and done callback', function() {
  var $ctx, doneCalled, totalMatches, totalMarkElements;
  beforeEach(function(done) {
    loadFixtures('across-elements/basic/main.html');

    totalMarkElements = totalMatches = doneCalled = 0;
    $ctx = $('.across-elements');
    new Mark($ctx[0]).mark(['lorem ipsum', 'dolor sit'], {
      'diacritics': false,
      'separateWordSearch': false,
      'acrossElements': true,
      'done': function(counter, matchCount) {
        doneCalled++;
        totalMarkElements = counter;
        totalMatches = matchCount;
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
    expect(totalMarkElements).toBe(11);
    expect(totalMatches).toBe(8);
  });
});
