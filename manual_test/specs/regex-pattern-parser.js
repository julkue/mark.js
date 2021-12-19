
'use strict';
describe('test the \'collectRegexGroupIndexes\' method', function() {
  var $ctx,
    // this regex contains different grouping and other constructs to test
    // the RegExp pattern parser
    reg = /(?<=f)(a(?:a(a))a(a))((?<gr5>\2)+)(b(b(?<n>b))(?:bb)(?!a))()(?:)((?:\k<n>|\(|\)|\\)+)([a-z/()[\]\\]+?)(?=d)/;

  beforeEach(function() {
    $ctx = $('.regex-pattern-parser');
  });

  it('should count and test content of collected groups', function(done) {
    var groupIndexes = [], groupCount = 0, content = '';

    new Mark($ctx[0]).markRegExp(reg, {
      'acrossElements' : true,
      'separateGroups' : true,
      filter : function(node, group, total, obj) {
        groupIndexes.push(obj.groupIndex);

        if (obj.groupIndex === 4 || obj.groupIndex === 10) {
          return false;
        }
        return true;
      },
      'each' : function(elem, info) {
        if (info.groupStart) {
          groupCount++;
          content += elem.textContent;
        }
      },
      'done' : function() {
        // 9th group is empty
        expect(groupIndexes).toEqual([1, 4, 6, 10, 11]);
        expect(groupCount).toBe(3);
        expect(content).toBe('aaaaabbbbb[c(p\\c/p)c]');
        done();
      }
    });
  });

  // additional test for 'wrapMatchGroups' with complex RegExp pattern
  it('should count and test content of groups with d flag', function(done) {
    var groupIndexes = [], groupCount = 0, content = '';
    new Mark($ctx[0]).markRegExp(new RegExp(reg.source, 'd'), {
      'acrossElements' : true,
      'separateGroups' : true,
      filter : function(node, group, total, obj) {
        groupIndexes.push(obj.groupIndex);
        // with d flag, if the parent group is filtered out, the nested group
        // will be marked - named capture group gr5
        if (obj.groupIndex === 4 || obj.groupIndex === 5 || obj.groupIndex === 10) {
          return false;
        }
        return true;
      },
      'each' : function(elem, info) {
        if (info.groupStart) {
          groupCount++;
          content += elem.textContent;
        }
      },
      'done' : function() {
        // 9th group is empty, the 5th nested group is added
        expect(groupIndexes).toEqual([1, 4, 5, 6, 10, 11]);
        expect(groupCount).toBe(3);
        expect(content).toBe('aaaaabbbbb[c(p\\c/p)c]');
        done();
      }
    });
  });
});
