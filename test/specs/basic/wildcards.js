'use strict';
describe('basic mark with wildcards', function() {
  var $ctx1, $ctx2, $ctx3, $ctx4, $ctx5, $ctx6, $ctx7, $ctx8;
  beforeEach(function(done) {
    loadFixtures('basic/wildcards.html');

    $ctx1 = $('.basic-wildcards > div:nth-child(1)');
    $ctx2 = $('.basic-wildcards > div:nth-child(2)');
    $ctx3 = $('.basic-wildcards > div:nth-child(3)');
    $ctx4 = $('.basic-wildcards > div:nth-child(4)');
    $ctx5 = $('.basic-wildcards > div:nth-child(5)');
    $ctx6 = $('.basic-wildcards > div:nth-child(6)');
    $ctx7 = $('.basic-wildcards > div:nth-child(7)');
    $ctx8 = $('.basic-wildcards > div:nth-child(8)');
    new Mark($ctx1[0]).mark('lor?m', {
      'separateWordSearch': false,
      'diacritics': false,
      'wildcards': 'enabled',
      'done': function() {
        new Mark($ctx2[0]).mark('lor*m', {
          'separateWordSearch': false,
          'diacritics': false,
          'wildcards': 'enabled',
          'done': function() {
            new Mark($ctx3[0]).mark(['lor?m', 'Lor*m'], {
              'separateWordSearch': false,
              'diacritics': false,
              'wildcards': 'enabled',
              'done': function() {
                new Mark($ctx4[0]).mark(['lor?m', 'Lor*m'], {
                  'separateWordSearch': false,
                  'diacritics': false,
                  'wildcards': 'disabled',
                  'done': function() {
                    new Mark($ctx5[0]).mark(['lore%%%%'], {
                      'separateWordSearch': false,
                      'diacritics': false,
                      'wildcards': 'enabled',
                      'done': function() {
                        new Mark($ctx6[0]).mark(['+rm+'], {
                          'separateWordSearch': false,
                          'diacritics': false,
                          'wildcards': 'enabled',
                          'done': function() {
                            new Mark($ctx7[0]).mark(['%%rm+'], {
                              'separateWordSearch': false,
                              'diacritics': false,
                              'wildcards': 'enabled',
                              'done': function() {
                                new Mark($ctx8[0]).mark(['%%rm*'], {
                                  'separateWordSearch': false,
                                  'diacritics': false,
                                  'wildcards': 'enabled',
                                  'done': done
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    it('should find \'?\' wildcard matches', function() {
      expect($ctx1.find('mark')).toHaveLength(6);
    });
    it('should find \'*\' wildcard matches', function() {
      expect($ctx2.find('mark')).toHaveLength(8);
    });
    it('should find both \'?\' and \'*\' matches', function() {
      expect($ctx3.find('mark')).toHaveLength(14);
    });
    it('should find wildcards as plain characters when disabled', function() {
      expect($ctx4.find('mark')).toHaveLength(2);
    });
    it('should find \'%\' wildcard matches', function() {
      expect($ctx5.find('mark')).toHaveLength(8);
    });
    it('should find \'+\' wildcard matches', function() {
      expect($ctx6.find('mark')).toHaveLength(12);
    });
    it('should find both \'+\' and \'%\' matches', function() {
      expect($ctx6.find('mark')).toHaveLength(12);
    });
    it('should find both \'*\' and \'%\' matches', function() {
      expect($ctx6.find('mark')).toHaveLength(16);
    });
  });
});
