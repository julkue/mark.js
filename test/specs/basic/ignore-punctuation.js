'use strict';
describe('basic mark with ignorePunctuation', function() {
  function getPunctuation() {
    return ':;.,-–—‒_(){}[]!\'"+='
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
      .split('');
  }
  var $ctx1, $ctx2, $ctx3, $ctx4,
    punctuation = getPunctuation(),
    regexp = new RegExp('[' + punctuation.join('') + ']', 'g');
  beforeEach(function(done) {
    loadFixtures('basic/ignore-punctuation.html');

    $ctx1 = $('.basic-ignore-punctuation > div:nth-child(1)');
    $ctx2 = $('.basic-ignore-punctuation > div:nth-child(2)');
    $ctx3 = $('.basic-ignore-punctuation > div:nth-child(3)');
    $ctx4 = $('.basic-ignore-punctuation > div:nth-child(4)');

    // 𠀀 = U+20000 = \uD840\uDC00
    // an interrupted surrogate pair '\uD840,\uDC00' cannot be written in
    // the HTML source directly, and thus we need to generate it using
    // the script here
    $ctx4.find('p:nth-child(4)').text('\uD840\uDC00 \uD840,\uDC00');

    new Mark($ctx1[0]).mark('ipsum', {
      'separateWordSearch': false,
      'diacritics': false,
      'ignorePunctuation': punctuation,
      'done': function() {
        new Mark($ctx2[0]).mark(['Lorem ipsum'], {
          'separateWordSearch': false,
          'diacritics': false,
          'ignorePunctuation': punctuation,
          'done': function() {
            new Mark($ctx3[0]).mark(['ipsum'], {
              'separateWordSearch': false,
              'diacritics': false,
              'ignorePunctuation': '',
              'done': function() {
                new Mark($ctx4[0]).mark(['a(b', 'a)b', 'a|b', '𠀀'], {
                  'separateWordSearch': false,
                  'diacritics': false,
                  'ignorePunctuation': punctuation,
                  'done': done
                });
              }
            });
          }
        });
      }
    });
  });

  it('should find single word matches', function() {
    expect($ctx1.find('mark')).toHaveLength(5);
    var count = 0;
    $ctx1.find('mark').each(function() {
      if ($(this).text().replace(regexp, '') === 'ipsum') {
        count++;
      }
    });
    expect(count).toBe(5);
  });
  it('should find matches containing whitespace', function() {
    expect($ctx2.find('mark')).toHaveLength(5);
    var count = 0,
      regex = /lorem\s+ipsum/i;
    $ctx2.find('mark').each(function() {
      if (regex.test($(this).text().replace(regexp, ''))) {
        count++;
      }
    });
    expect(count).toBe(5);
  });
  it('should not find matches when disabled', function() {
    expect($ctx3.find('mark')).toHaveLength(1);
  });
  it('"a(b" should match "a,(,b"', function() {
    expect($ctx4.find('p:nth-child(1) mark').text()).toBe('a,(,b');
  });
  it('"a)b" should match "a,),b"', function() {
    expect($ctx4.find('p:nth-child(2) mark').text()).toBe('a,),b');
  });
  it('"a|b" should match "a,|,b"', function() {
    expect($ctx4.find('p:nth-child(3) mark').text()).toBe('a,|,b');
  });
  it('a UTF-16 surrogate pair should not be interrupted', function() {
    expect($ctx4.find('p:nth-child(4) mark').text()).toBe('𠀀');
  });
});
