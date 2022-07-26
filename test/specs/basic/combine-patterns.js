'use strict';
describe('combine patterns without acrossElements option', function() {
  var $ctx;
  var words = ['lorem', 'ipsum', 'dolor', 'sed', 'diam'];

  beforeEach(function() {
    loadFixtures('basic/combine-patterns.html');

    $ctx = $('.context');
  });

  it('should mark array with combinePatterns option', function(done) {
    new Mark($ctx[0]).mark(words, {
      'combinePatterns' : 3,
      'accuracy' : 'exactly',
      'done' : function(m, totalMatches) {
        expect(totalMatches).toBe(20);
        expect(checkWords()).toBe(true);
        done();
      }
    });
  });

  function checkWords() {
    var success = true;
    // it checks correctness of marked words
    $('mark').each(function(i, elem) {
      if (words.indexOf(elem.textContent.toLowerCase()) === -1) {
        success = false;
        return false;
      }
      return true;
    });
    return success;
  }
});
