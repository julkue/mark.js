'use strict';
describe('basic mark with synonyms in an array', function() {
  var $ctx;
  beforeEach(function(done) {
    loadFixtures('basic/synonyms-array.html');

    $ctx = $('.basic-synonyms-array > div');
    new Mark($ctx[0]).mark('1', {
      accuracy: 'exactly',
      synonyms: {
        '1': ['one', 'a', 'single', 'sole']
      },
      'done': done
    });
  });

  it('should combine synonym values in an array', function() {
    expect($ctx.find('mark')).toHaveLength(11);
  });
});
