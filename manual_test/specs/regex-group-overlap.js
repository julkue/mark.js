
'use strict';
describe('test the attempts to mark the overlap groups', function() {
  var $ctx, $ctx2,
    // aa--bb--aa--ff--aa--ff--aa
    regs = [
      /(?<=(aa)--\w+).+?(ff)/dg,
      /(?<=(aa)).+?(?=--(ff))/dg,
      /(aa).+?(?=\w+--(ff))/dg,
      /(?<=(aa)--\w+).+?(ff)/g,
      /(?<=(aa)).+?(?=--(ff))/g,
      /(aa).+?(?=\w+--(ff))/g
    ];

  beforeEach(function() {
    $ctx = $('.regex-group-overlap');
    $ctx2 = $('.regex-group-overlap-across-elements');
    //$ctx.unmark();
  });

  it('should not throws the DOM exception', function(done) {
    for(var i = 0; i < regs.length; i++) {
      var content = '';

      new Mark($ctx[0]).markRegExp(regs[i], {
        'separateGroups' : true,
        'each' : function(elem) {
          content += elem.textContent;
        },
        'done' : function() {
          expect(content).toBe('aaff');
          $ctx.unmark();
          done();
        }
      });
    }
  });

  it('should not throws the DOM exception across elements', function(done) {
    for(var i = 0; i < regs.length; i++) {
      var content = '';

      new Mark($ctx2[0]).markRegExp(regs[i], {
        'separateGroups' : true,
        'acrossElements' : true,
        'each' : function(elem) {
          content += elem.textContent;
        },
        'done' : function() {
          if(i < 3) {
            expect(content).toBe('aaffff');
          } else {
            expect(content.length).toBeGreaterThan(3);
          }
          done();
        }
      });
    }
  });
});
