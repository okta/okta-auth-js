define(function() {
  var tokens = {};

  tokens.unicodeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyAibXNnX2VuIjogIkhlbGxvIiwKICAibXNnX2pwIjogIuOBk-OCk-OBq' + 
    '-OBoeOBryIsCiAgIm1zZ19jbiI6ICLkvaDlpb0iLAogICJtc2dfa3IiOi' +
    'Ai7JWI64WV7ZWY7IS47JqUIiwKICAibXNnX3J1IjogItCX0LTRgNCw0LL' +
    'RgdGC0LLRg9C50YLQtSEiLAogICJtc2dfZGUiOiAiR3LDvMOfIEdvdHQi' +
    'IH0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

  tokens.unicodeDecoded = {
    header: {
      'alg': 'HS256',
      'typ': 'JWT'
    },
    payload: {
      'msg_en': 'Hello',
      'msg_jp': 'こんにちは',
      'msg_cn': '你好',
      'msg_kr': '안녕하세요',
      'msg_ru': 'Здравствуйте!',
      'msg_de': 'Grüß Gott'
    },
    signature: 'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
  };

  return tokens;
});
