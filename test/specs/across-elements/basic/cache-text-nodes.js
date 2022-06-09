'use strict';
describe('cache text nodes with acrossElements option', function() {
  var $ctx;
  var words = ['lorem', 'ipsum', 'dolor', 'sed', 'diam'];

  beforeEach(function() {
    loadFixtures('across-elements/basic/cache-text-nodes.html');

    $ctx = $('.context');
  });

  it('should build & wrap ranges from array', function(done) {
    var ranges = [], total = 0;

    new Mark($ctx[0]).mark(words, {
      'cacheTextNodes' : true,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      'filter' : function(node, term, t, c, info) {
        if (info.matchStart) {
          total++;
        }

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
            var failed = false;
            // it checks correctness of marked words
            $('mark').each(function(i, elem) {
              if (words.indexOf(elem.textContent.toLowerCase()) === -1) {
                failed = true;
                return false;
              }
              return true;
            });

            expect(totalMatches).toBe(total);
            expect(totalMatches).toBe(20);
            expect(failed).toBe(false);
            done();
          }
        });
      }
    });
  });
});
