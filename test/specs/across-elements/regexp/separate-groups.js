'use strict';
describe('markRegExp with acrossElements and separateGroups', function() {
  var $ctx,
    matchCount, group1Count, group2Count, group3Count,
    message = 'should count and test content of separate groups ',
    groupReg = /\b(group1)\b.+?\b(group2)\b@?(?:\s+(?:\w+\s+)?(\w+3))?\b/gi,
    nestedGr = /\b([a-z]+1\b.+?\b(group2)\b@?)(?:\s+(?:\w+\s+)?(\w+3))?\b/gi;

  beforeEach(function() {
    loadFixtures('across-elements/regexp/separate-groups.html');

    $ctx = $('.across-elements-separate-groups');
    matchCount = 0, group1Count = 0, group2Count = 0, group3Count = 0;
  });

  afterEach(function() {
    $ctx.unmark();
  });

  it(message, function(done) {
    new Mark($ctx[0]).markRegExp(groupReg, {
      'acrossElements' : true,
      'separateGroups' : true,
      each : eachMark,
      'done' : function() {
        // mch, gr1, gr2, gr3,
        test([27, 27, 27, 16]);
        done();
      }
    });
  });

  it('should count separate groups in loop of 3 goes', function(done) {
    // it mostly test 'getTextNodesAcrossElements' method
    for (var i = 1; i < 4; i++)  {
      matchCount = 0, group1Count = 0, group2Count = 0, group3Count = 0;

      new Mark($ctx[0]).markRegExp(groupReg, {
        'acrossElements' : true,
        'separateGroups' : true,
        each : eachMark,
        'done' : function() {
          expect(matchCount).toBe(27);
          expect(group1Count).toBe(27);
          expect(group2Count).toBe(27);
          expect(group3Count).toBe(16);
          done();
        }
      });
    }
  });

  it('should count filtered separate groups', function(done) {
    new Mark($ctx[0]).markRegExp(groupReg, {
      'acrossElements' : true,
      'separateGroups' : true,
      filter : function(node, group, total, obj) {
        // current group index. Note: if group lays across several elements
        // the index will be the same while the current group is wrapping
        if (obj.groupIndex === 1 || obj.groupIndex === 3) {
          return false;
        }
        return true;
      },
      each : eachMark,
      'done' : function() {
        // mch, gr1, gr2, gr3,
        test([27, 0, 27, 0]);
        done();
      }
    });
  });

  it(message + 'with nested group', function(done) {
    new Mark($ctx[0]).markRegExp(nestedGr, {
      'acrossElements' : true,
      'separateGroups' : true,
      each : eachMark,
      'done' : function() {
        // mch, gr1, gr2, gr3,
        test([27, 27, 0, 16]);
        done();
      }
    });
  });

  function eachMark(elem, info) {
    if (info.matchStart) {
      matchCount++;
    }
    if (info.groupStart) {
      // info.groupIndex is index of the current match group
      if (info.groupIndex === 1) {
        elem.className = 'group1-1';
        group1Count++;

      } else if (info.groupIndex === 2) {
        elem.className = 'group2-1';
        group2Count++;

      } else if (info.groupIndex === 3) {
        elem.className = 'group3-1';
        group3Count++;
      }
    }
  }

  function test(val) {
    var count, marks = $ctx.find('mark');

    expect(matchCount).toBe(val[0]);

    count = testMarkedText(marks, 'group1-1', /group1(?:\s*text\s*)?/i);
    expect(count).toBe(group1Count);
    expect(group1Count).toBe(val[1]);

    count = testMarkedText(marks, 'group2-1', /group2/i);
    expect(count).toBe(group2Count);
    expect(group2Count).toBe(val[2]);

    count = testMarkedText(marks, 'group3-1', /group3/i);
    expect(count).toBe(group3Count);
    expect(group3Count).toBe(val[3]);
  }

  function testMarkedText(marks, klass, reg) {
    var count = 0;
    marks.filter(function() {
      // filter all start elements
      return $(this).hasClass(klass);

    }).each(function(i, elem) {
      expect(getMarkedText(elem, marks)).toMatch(reg);
      count++;
    });
    return count;
  }

  // it aggregates text across elements
  function getMarkedText(elem, marks) {
    var text = '', found = false;
    marks.each(function(i, el) {
      if ( !found) {
        // start element of the group
        if (el === elem) {
          found = true;
        }
      // start of the next group means the end of the current group
      } else if (el.className && /\b[a-z]+\d-1\b/.test(el.className)) {
        return false;
      }
      if (found) {
        text += $(this).text();
      }
      return true;
    });
    return text;
  }
});
