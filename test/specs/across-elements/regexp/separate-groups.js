'use strict';
describe('markRegExp with acrossElements and separateGroups', function() {
  var $ctx,
    matchCount, group1Count, group2Count, group3Count,
    message = 'should correctly count separate groups ',
    reg = /\b(group1)\b.+?\b(group2)\b(?:\s+(?:\w+\s+)?(group3))?\b/gi;

  beforeEach(function() {
    loadFixtures('across-elements/regexp/separate-groups.html');
    
    $ctx = $('.across-elements-separate-groups');
    reg.lastIndex = 0;
    matchCount = 0, group1Count = 0, group2Count = 0, group3Count = 0;
  });

  it(message, function(done) {
    new Mark($ctx[0]).markRegExp(reg, {
      'acrossElements' : true,
      'separateGroups' : true,
      each : eachMark,
      'done' : function(total) {
        expect(matchCount).toBe(27);
        expect($ctx.find('mark.group1-1')).toHaveLength(group1Count);
        expect(group1Count).toBe(27);
        expect($ctx.find('mark.group2-1')).toHaveLength(group2Count);
        expect(group2Count).toBe(27);
        expect($ctx.find('mark.group3-1')).toHaveLength(group3Count);
        expect(group3Count).toBe(14);
        //expect(total).toBe(74);
        expect($ctx.find('mark')).toHaveLength(total);
        done();
      }
    });
  });

  it(message + 'with nested group', function(done) {
    var reg = /\b(group1\b.+?\b(group2))\b(?:\s+(?:\w+\s+)?(group3))?\b/gi;
    new Mark($ctx[0]).markRegExp(reg, {
      'acrossElements' : true,
      'separateGroups' : true,
      each : eachMark,
      'done' : function(total) {
        expect(matchCount).toBe(27);
        expect($ctx.find('mark.group1-1')).toHaveLength(group1Count);
        expect(group1Count).toBe(27);
        expect($ctx.find('mark.group2-1')).toHaveLength(group2Count);
        expect(group2Count).toBe(0);
        expect($ctx.find('mark.group3-1')).toHaveLength(group3Count);
        expect(group3Count).toBe(14);
        //expect(total).toBe(74);
        expect($ctx.find('mark')).toHaveLength(total);
        done();
      }
    });
  });

  it(message + 'with ignoreGroups : 1', function(done) {
    new Mark($ctx[0]).markRegExp(reg, {
      'acrossElements' : true,
      'separateGroups' : true,
      'ignoreGroups' : 1,
      each : eachMark,
      'done' : function(total) {
        expect(matchCount).toBe(27);
        expect($ctx.find('mark.group1-1')).toHaveLength(0);
        expect(group1Count).toBe(0);
        expect($ctx.find('mark.group2-1')).toHaveLength(group2Count);
        expect(group2Count).toBe(27);
        expect($ctx.find('mark.group3-1')).toHaveLength(group3Count);
        expect(group3Count).toBe(14);
        expect($ctx.find('mark')).toHaveLength(total);
        done();
      }
    });
  });

  it(message + 'with ignoreGroups : 2', function(done) {
    new Mark($ctx[0]).markRegExp(reg, {
      'acrossElements' : true,
      'separateGroups' : true,
      'ignoreGroups' : 2,
      each : eachMark,
      'done' : function(total) {
        expect(matchCount).toBe(14);
        expect($ctx.find('mark.group1-1')).toHaveLength(0);
        expect(group1Count).toBe(0);
        expect($ctx.find('mark.group2-1')).toHaveLength(0);
        expect(group2Count).toBe(0);
        expect($ctx.find('mark.group3-1')).toHaveLength(group3Count);
        expect(group3Count).toBe(14);
        expect($ctx.find('mark')).toHaveLength(total);
        done();
      }
    });
  });

  function eachMark(elem, info)  { 
    if (info.matchNodeIndex === 0) {
      matchCount++;
    }
    if (info.groupNodeIndex === 0) {
      if (info.index === 1) {
        elem.className = 'group1-1';
        group1Count++;
      } else if (info.index === 2) {
        elem.className = 'group2-1';
        group2Count++;
      } else if (info.index === 3) {
        elem.className = 'group3-1';
        group3Count++;
      }
    }
  }
});
