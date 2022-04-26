
'use strict';
describe('markRegExp with separateGroups & wrapAllRanges option', function() {
  var $ctx,
    flags = 'dg',
    message = 'should mark capture groups inside positive ',
    // the RegExp patterns below create overlapping groups in the same match
    lookaround = '(?<=(a)\\w*)(?=\\w*(b))(?=\\w*(c))(?=\\w*(d))(?=\\w*(e))',
    lookahead = '\\b(?=\\w*(a))(?=\\w*(b))(?=\\w*(c))(?=\\w*(d))(?=\\w*(e))',
    lookbehind = '\\b(?:(?<=(a)\\w*)(?<=(b)\\w*)(?<=(c)\\w*)(?<=(d)\\w*))';

  beforeEach(function() {
    //loadFixtures('across-elements/regexp/nested-overlapped-groups.html');
    $ctx = $('.overlapping-groups');
  });

  afterEach(function() {
    $ctx.unmark();
  });
  
  it(message + 'lookbehind assertion', function(done) {
    var groupCount = 0;
    new Mark($ctx[0]).markRegExp(new RegExp(lookbehind, flags), {
      'acrossElements' : true,
      'separateGroups' : true,
      'wrapAllRanges' : true,
      each : function() {
        groupCount++;
      },
      'done' : function() {
        expect(groupCount).toBe(24);
        done();
      }
    });
  });

  it(message + 'lookahead assertion', function(done) {
    var groupCount = 0;
    new Mark($ctx[0]).markRegExp(new RegExp(lookahead, flags), {
      'acrossElements' : true,
      'separateGroups' : true,
      'wrapAllRanges' : true,
      each : function() {
        groupCount++;
      },
      'done' : function() {
        expect(groupCount).toBe(30);
        done();
      }
    });
  });

  it(message + 'lookaround assertions', function(done) {
    var groupCount = 0;
    new Mark($ctx[0]).markRegExp(new RegExp(lookaround, flags), {
      'acrossElements' : true,
      'separateGroups' : true,
      'wrapAllRanges' : true,
      each : function() {
        groupCount++;
      },
      'done' : function() {
        expect(groupCount).toBe(10);
        done();
      }
    });
  });
  
  // a hack to mark groups inside positive lookaround.
  it(message + 'lookaround without acrossElements option', function(done) {
    let rangeCount = 0,
      ranges = buildRanges($ctx[0], new RegExp(lookaround, flags));

    new Mark($ctx[0]).markRanges(ranges, {
      'wrapAllRanges' : true,
      each : function() {
        rangeCount++;
      },
      'done' : function() {
        expect(rangeCount).toBe(10);
        done();
      }
    });
  });
  
  // a hack to mark nesting groups.
  it('should mark nested groups without acrossElements opt', function(done) {
    let rangeCount = 0,
      context = $('.nesting-groups')[0],
      pattern = '(.+?(\\d+)\\w)(.+?(\\d+).+?(\\d+)\\w)(.+?(\\d+(.+?)\\d+).+)',
      ranges = buildRanges(context, new RegExp(pattern, flags));

    new Mark(context).markRanges(ranges, {
      'wrapAllRanges' : true,
      each : function() {
        rangeCount++;
      },
      'done' : function() {
        expect(rangeCount).toBe(8);
        done();
      }
    });
  });

  function buildRanges(context, regex) {
    let ranges = [];
    // it should only build ranges - an attempt to mark any group can break
    // the regex normal workflow
    new Mark(context).markRegExp(regex, {
      'separateGroups' : true,
      'filter' : function(node, group, totalMatch, info) {
        if (info.matchStart) {
          // 'i = 1' - skips match[0] group
          for (let i = 1; i < info.match.length; i++)  {
            if (info.match[i]) {
              let indices = info.match.indices[i];
              // info.offset is added to translate the local group index
              // to the absolute one
              let range = {
                start : info.offset + indices[0],
                length : indices[1] - indices[0]
              };
              ranges.push(range);
            }
          }
        }
        return false;
      }
    });
    return  ranges;
  }
});

