
'use strict';
describe('test the \'collectRegexGroupIndexes\' method', function() {
  var $ctx,
    // this regex contains capture/non-capture groups and other structures
    // to test the RegExp pattern parser.
    reg = /(?<=f)(a(?:a(a))a(a))((?<gr5>\2)+)(b(b(?<n>b))(?:bb)(?!a))()(?:)((?:\k<n>|\(|\)|\\)+)([a-z/()[\]\\]+?)(?=d)/;

  beforeEach(function() {
    $ctx = $('.regex-groups-filter');
  });

  it('should count and test content of collected parent groups', function(done) {
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
        // 9th group is empty one
        expect(groupIndexes).toEqual([1, 4, 6, 10, 11]);
        expect(groupCount).toBe(3);
        expect(content).toBe('aaaaabbbbb[c(p\\c/p)c]');
        done();
      }
    });
  });

  // additional test for 'wrapMatchGroups' with complex RegExp pattern
  it('should count and test content of groups with d flag', function(done) {
    var groupCount = 0, content = '';
    new Mark($ctx[0]).markRegExp(new RegExp(reg.source, 'd'), {
      'acrossElements' : true,
      'separateGroups' : true,
      filter : function(node, group, total, obj) {
        // with d flag, if the parent group is filtered out,
        // the nested group(s) will be marked - named capture group gr5
        groupCount++;
        if (obj.groupIndex === 4 || obj.groupIndex === 10) {
          return false;
        }
        return true;
      },
      'each' : function(elem, info) {
        if (info.groupStart) {
          content += elem.textContent;
        }
      },
      'done' : function() {
        expect(groupCount).toBe(6);
        expect(content).toBe('aaaaaabbbbb[c(p\\c/p)c]');
        done();
      }
    });
  });
});
