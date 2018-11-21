'use strict';
describe('mark with regular expression and separateGroups', function() {
  var $ctx1, $ctx2, $ctx3, $ctx4;
  beforeEach(function(done) {
    loadFixtures('regexp/separate-groups.html');

    $ctx1 = $('.regexp-separate-groups > div:nth-child(1)');
    $ctx2 = $('.regexp-separate-groups > div:nth-child(2)');
    $ctx3 = $('.regexp-separate-groups > div:nth-child(3)');
    $ctx4 = $('.regexp-separate-groups > div:nth-child(4)');
    new Mark($ctx1[0]).markRegExp(/(?:\[%)([a-z_]+):(\w+?)(?:%])/g, {
      separateGroups: true,
      done: function() {
        new Mark($ctx2[0]).markRegExp(/(\w+)-(\w+)/g, {
          separateGroups: true,
          done: function() {
            new Mark($ctx3[0]).markRegExp(/(\w+)-(\w+)/g, {
              separateGroups: false,
              done: function() {
                new Mark($ctx4[0]).markRegExp(/\w+-\w+/g, {
                  separateGroups: true,
                  done: done
                });
              }
            });
          }
        });
      }
    });
  });

  it('should separate groups when enabled', function() {
    expect($ctx1.find('mark')).toHaveLength(6);
    var results = ['test', 'value', 'testx', 'value2', 'testz', '123'];
    $ctx1.find('mark').each(function(indx) {
      expect($(this).text()).toBe(results[indx]);
    });
  });
  it('should not separate groups when disabled', function() {
    expect($ctx2.find('mark')).toHaveLength(8);
    var results = [
      'test', '1w',
      'test', '2x',
      'lorem', '3y',
      'ipsum', '4z'
    ];
    $ctx2.find('mark').each(function(indx) {
      expect($(this).text()).toBe(results[indx]);
    });
  });
  it('should not separate groups when disabled', function() {
    expect($ctx3.find('mark')).toHaveLength(4);
  });
  it('should not cause an infinite loop with no groups in regexp', function() {
    expect($ctx4.find('mark')).toHaveLength(4);
  });
});
