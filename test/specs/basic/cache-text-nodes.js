'use strict';
describe('cache text nodes without acrossElements option', function() {
  var $ctx;
  var words = ['lorem', 'ipsum', 'dolor', 'sed', 'diam'];

  beforeEach(function() {
    loadFixtures('basic/cache-text-nodes.html');

    $ctx = $('.context');
  });

  it('should mark array with cacheTextNodes option', function(done) {
    new Mark($ctx[0]).mark(words, {
      'cacheTextNodes' : true,
      'accuracy' : 'exactly',
      'done' : function(m, totalMatches) {
        expect(totalMatches).toBe(20);
        expect(checkWords()).toBe(true);
        done();
      }
    });
  });

  it('should build & wrap ranges from array', function(done) {
    var ranges = [], total = 0;

    new Mark($ctx[0]).mark(words, {
      'cacheTextNodes' : true,
      'accuracy' : 'exactly',
      'filter' : function(node, term, t, c, info) {
        total++;

        ranges.push({
          start : info.offset + info.match.index + info.match[1].length,
          length : info.match[2].length,
        });
        // it should only build ranges
        return  false;
      },
      'done' : function() {
        new Mark($ctx[0]).markRanges(ranges, {
          done : function(totalMarks, totalMatches) {
            expect(totalMatches).toBe(total);
            expect(totalMatches).toBe(20);
            expect(checkWords()).toBe(true);
            done();
          }
        });
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
