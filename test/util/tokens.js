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

  tokens.standardIdToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMH' +
                           'UxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJMZW4gQm95ZXR0Z' +
                           'SIsImdpdmVuX25hbWUiOiJMZW4iLCJmYW1pbHlfbmFtZSI6IkJv' +
                           'eWV0dGUiLCJ1cGRhdGVkX2F0IjoxNDQ2MTUzNDAxLCJlbWFpbCI' +
                           '6Imxib3lldHRlQG9rdGEuY29tIiwiZW1haWxfdmVyaWZpZWQiOn' +
                           'RydWUsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9sYm95ZXR0ZS50c' +
                           'mV4Y2xvdWQuY29tIiwibG9naW4iOiJhZG1pbkBva3RhLmNvbSIs' +
                           'Im5vbmNlIjoiYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWF' +
                           'hYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYSIsIm' +
                           'F1ZCI6Ik5QU2ZPa0g1ZVpyVHk4UE1EbHZ4IiwiaWF0IjoxNDQ5N' +
                           'jk2MzMwLCJleHAiOjE0NDk2OTk5MzAsImFtciI6WyJrYmEiLCJt' +
                           'ZmEiLCJwd2QiXSwianRpIjoiVFJaVDdSQ2lTeW1UczVXN1J5aDM' +
                           'iLCJhdXRoX3RpbWUiOjE0NDk2OTYzMzB9.w_JtTGqho5rIVvIkh' +
                           'OyXun2wzOeWOw-1eNBqwy15XvEj_lrz2rVJW9-kxKZgLyQRMRcb' +
                           '7br_I284szVX848gQQ-E5X73j9uuBmpYRtrAlb35E4TUXGKxXs9' +
                           'kgJku2QOQeX-AHQj0MSWzDMSjK2JqJxnwifi6pgFA8RMiNfmLloc';

  tokens.standardIdTokenClaims = {
    'sub': '00u1pcla5qYIREDLWCQV',
    'name': 'Len Boyette',
    'given_name': 'Len',
    'family_name': 'Boyette',
    'updated_at': 1446153401,
    'email': 'lboyette@okta.com',
    'email_verified': true,
    'ver': 1,
    'iss': 'https://lboyette.trexcloud.com',
    'login': 'admin@okta.com',
    'nonce': 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aud': 'NPSfOkH5eZrTy8PMDlvx',
    'iat': 1449696330,
    'exp': 1449699930,
    'amr': [
      'kba',
      'mfa',
      'pwd'
    ],
    'jti': 'TRZT7RCiSymTs5W7Ryh3',
    'auth_time': 1449696330
  };

  return tokens;
});
