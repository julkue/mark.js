'use strict';
describe('markRegExp with acrossElements and ignoreGroups', function() {
  var matchCount;
  beforeEach(function() {
    loadFixtures('across-elements/regexp/ignore-groups-2.html');
    matchCount = 0; 
  });

  it('should mark \'some text\' with ignoreGroups : 1', function(done) {
    var reg = /\b(group1)\s+some\s+\w+\b/gi,
      $ctx = $('.across-elements-ignore-groups-1');

    new Mark($ctx[0]).markRegExp(reg, {
      className : 'text',
      'acrossElements' : true,
      'ignoreGroups' : 1,
      each : eachMark,
      'done' : function(total) {
        expect(matchCount).toBe(6);
        
        var marks = $ctx.find('mark');
        marks.find('.text-1').each(function() {
          expect(getMarkText($(this), marks)).toBe('some text');
        });
        //expect(total).toBe(11);
        expect(marks).toHaveLength(total);
        done();
      }
    });
  });

  it('should mark \'some text\' with ignoreGroups : 2', function(done) {
    var reg = /\b(group1)\b.+?\b(group2)\s+some\s+\w+\b/gi,
      $ctx = $('.across-elements-ignore-groups-2');

    new Mark($ctx[0]).markRegExp(reg, {
      className : 'text',
      'acrossElements' : true,
      'ignoreGroups' : 2,
      each : eachMark,
      'done' : function(total) {
        expect(matchCount).toBe(7);

        var marks = $ctx.find('mark');
        marks.find('.text-1').each(function() {
          expect(getMarkText($(this), marks)).toBe('some text');
        });
        //expect(total).toBe(15);
        expect(marks).toHaveLength(total);
        done();
      }
    });
  });

  it('should mark \'some text\' with optional ignore group', function(done) {
    var reg = /\b(group1)\b(?:.+?\b(group2))?\s+some\s+\w+\b/gi,
      $ctx = $('.across-elements-ignore-groups-2');

    new Mark($ctx[0]).markRegExp(reg, {
      className : 'text',
      'acrossElements' : true,
      'ignoreGroups' : 2,
      each : eachMark,
      'done' : function(total) {
        expect(matchCount).toBe(9);

        var marks = $ctx.find('mark');
        marks.find('.text-1').each(function() {
          expect(getMarkText($(this), marks)).toBe('some text');
        });
        //expect(total).toBe(19);
        expect(marks).toHaveLength(total);
        done();
      }
    });
  });

  it('should mark \'some text\' with nested ignore group', function(done) {
    var reg = /\b(group1\b.+\b(group2))\s+some\s+\w+\b/gi,
      $ctx = $('.across-elements-ignore-groups-2');

    new Mark($ctx[0]).markRegExp(reg, {
      className : 'text',
      'acrossElements' : true,
      'ignoreGroups' : 2,
      each : eachMark,
      'done' : function(total) {
        expect(matchCount).toBe(7);

        var marks = $ctx.find('mark');
        marks.find('.text-1').each(function() {
          expect(getMarkText($(this), marks)).toBe('some text');
        });
        //expect(total).toBe(15);
        expect(marks).toHaveLength(total);
        done();
      }
    });
  });

  function eachMark(elem, info)  {
    if (info.matchNodeIndex === 0) {
      elem.className = 'text-1';
      matchCount++;
    }
  }

  // it collect match text across elements
  function getMarkText(elem, marks) {
    var text = '', match = false;
    marks.each(function(i, el) {
      if ( !match) {
        if (el === elem[0]) {
          match = true;
        }

      } else if ($(this).hasClass('text-1')) {
        return  false;
      }
      if (match) {
        text += $(this).text();
      }
      return true; 
    });
    return  text;
  }
});
