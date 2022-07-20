'use strict';
describe('cache text nodes with acrossElements option', function() {
  var $ctx;
  var words = ['lorem', 'ipsum', 'dolor', 'sed', 'diam'];

  beforeEach(function() {
    loadFixtures('across-elements/basic/cache-text-nodes.html');

    $ctx = $('.context');
  });

  it('should mark array with cacheTextNodes & wrapAllRanges', function(done) {
    var count = 0;

    new Mark($ctx[0]).mark(words, {
      'cacheTextNodes' : true,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      'wrapAllRanges' : true,
      'each' : function(elem, info) {
        if (info.matchStart) {
          count++;
        }
        $(elem).attr('data-markjs', count);
      },
      'done' : function(m, totalMatches) {
        expect(totalMatches).toBe(20);
        expect(checkWords()).toBe(true);
        done();
      }
    });
  });

  it('should build & wrap ranges from array', function(done) {
    var ranges = [], count = 0;

    new Mark($ctx[0]).mark(words, {
      'cacheTextNodes' : true,
      'accuracy' : 'exactly',
      'acrossElements' : true,
      'filter' : function(node, term, t, c, info) {
        if (info.matchStart) {
          count++;
        }

        ranges.push({
          start : info.offset + info.match.index + info.match[1].length,
          length : info.match[2].length,
          count : count
        });
        // it should only build ranges
        return  false;
      },
      'done' : function() {
        new Mark($ctx[0]).markRanges(ranges, {
          'each' : function(elem, range) {
            $(elem).attr('data-markjs', range.count);
          },
          done : function(totalMarks, totalMatches) {
            expect(totalMatches).toBe(count);
            expect(totalMatches).toBe(20);
            expect(checkWords()).toBe(true);
            done();
          }
        });
      }
    });
  });

  function checkWords() {
    var attr, attrPrev = '-1', word = '', success = true;
    // combines text node content with the same attribute values into words
    $('mark').each(function(i, elem) {
      attr = $(elem).attr('data-markjs');

      if (word === '' || attr === attrPrev) {
        word += elem.textContent;

      } else {
        if (words.indexOf(word.toLowerCase()) === -1) {
          success = false;
          return false;
        }
        word = elem.textContent;
      }
      attrPrev = attr;
      return true;
    });
    return success;
  }
});
