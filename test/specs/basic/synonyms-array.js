'use strict';
describe('basic mark with synonyms in an array', function() {
  var $ctx1, $ctx2;
  beforeEach(function(done) {
    loadFixtures('basic/synonyms-array.html');

    $ctx1 = $('.basic-synonyms-array > div:nth-child(1)');
    $ctx2 = $('.basic-synonyms-array > div:nth-child(2)');
    new Mark($ctx1[0]).mark('1', {
      accuracy: 'exactly',
      synonyms: {
        '1': ['one', 'a', 'single', 'sole']
      },
      'done': function() {
        new Mark($ctx2[0]).mark('Lorem', {
          accuracy: 'exactly',
          synonyms: {
            'i*m': ['lorem', 'do?or']
          },
          wildcards: 'enabled',
          'done': done
        });
      }
    });
  });

  it('should combine synonym values in an array', function() {
    expect($ctx1.find('mark')).toHaveLength(11);
  });

  it('wildcards in synonym array should work', function() {
    expect($ctx2.find('mark')).toHaveLength(4);
  });
});
