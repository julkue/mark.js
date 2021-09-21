'use strict';
describe('get text nodes with taking into account html elements', function() {
  var $ctx;
  beforeEach(function() {
    loadFixtures('across-elements/basic/get-text.html');

    $ctx = $('.across-elements-get-text');
  });

  it('should correctly count whole words in match.input', function(done) {
    var count = 0, text;
    new Mark($ctx[0]).markRegExp(/^\s*\w+\b/g, {
      'acrossElements' : true,
      each : function(elem, info)  {
        text = info.match.input;
      },
      'done' : function() {
        var reg = /\b\w+\b/g;
        while (reg.exec(text) !== null) {
          count++;
        }
        expect(count).toBe(56);
        done();
      }
    });
  });
});
