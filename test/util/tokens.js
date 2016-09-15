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

  tokens.verifiableIdToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRU' +
                             'RMV0NRViIsIm5hbWUiOiJMZW4gQm95ZXR0ZSIsImdpdmVuX25hb' +
                             'WUiOiJMZW4iLCJmYW1pbHlfbmFtZSI6IkJveWV0dGUiLCJ1cGRh' +
                             'dGVkX2F0IjoxNDQ2MTUzNDAxLCJlbWFpbCI6Imxib3lldHRlQG9' +
                             'rdGEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInZlciI6MS' +
                             'wiaXNzIjoiaHR0cHM6Ly9sYm95ZXR0ZS50cmV4Y2xvdWQuY29tI' +
                             'iwibG9naW4iOiJhZG1pbkBva3RhLmNvbSIsImF1ZCI6Ik5QU2ZP' +
                             'a0g1ZVpyVHk4UE1EbHZ4IiwiaWF0IjoxNDQ5Njk2MzMwLCJleHA' +
                             'iOjE0NDk2OTk5MzAsImFtciI6WyJrYmEiLCJtZmEiLCJwd2QiXS' +
                             'wianRpIjoiVFJaVDdSQ2lTeW1UczVXN1J5aDMiLCJhdXRoX3Rpb' +
                             'WUiOjE0NDk2OTYzMzB9.YWCNE3ZvT-8ceKnAbTkmSxYE-jIPpfh' +
                             '2s8f_hTagUUxrfdKgyWzBb9iN3GOPaQ2K6jqOFx90RI2GBzAWec' +
                             'pel3sAxG-wvLqiy0d8g0CUb7XTHdhXOLRrXvlpbULxdNnMbBcc6' +
                             'uOLDalBjrumOiDMLzti-Bx6uQQ0EjUwuC-Dhv7I3wMsVxyEKejv' +
                             'jMLbfWJ6iu4-UUx1r8_ZZUjDDXSB3OFXJQ3nPwRVFXZuRNhGScL' +
                             'nftXz7mypRGxrapIQusym1K8hk9uy8_KYL2H2QNbyIqK9Vh9JhY' +
                             '1rtkQNpv3ZerCUXEVGRiEXDqR_OHu4vUi1-FkONZZe2ov8dQ1mX' +
                             'iHHdw';

  tokens.standardIdToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOi' +
                           'IwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1sI' +
                           'EphY2tzb24iLCJnaXZlbl9uYW1lIjoiU2FtbCIsImZhbWls' +
                           'eV9uYW1lIjoiSmFja3NvbiIsInVwZGF0ZWRfYXQiOjE0NDY' +
                           'xNTM0MDEsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb2' +
                           '0iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwidmVyIjoxLCJpc' +
                           '3MiOiJodHRwczovL2F1dGgtanMtdGVzdC5va3RhLmNvbSIs' +
                           'ImxvZ2luIjoiYWRtaW5Ab2t0YS5jb20iLCJub25jZSI6ImF' +
                           'hYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYW' +
                           'FhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWEiLCJhdWQiO' +
                           'iJOUFNmT2tINWVaclR5OFBNRGx2eCIsImlhdCI6MTQ0OTY5' +
                           'NjMzMCwiZXhwIjoxNDQ5Njk5OTMwLCJhbXIiOlsia2JhIiw' +
                           'ibWZhIiwicHdkIl0sImp0aSI6IlRSWlQ3UkNpU3ltVHM1Vz' +
                           'dSeWgzIiwiYXV0aF90aW1lIjoxNDQ5Njk2MzMwfQ.PDuo7r' +
                           'brqHIqXRIuF5eP-hovEs9ZBVuwXf7_qKUKld-2c7YVguuSO' +
                           'uhXvC4ngcZhxjw9Y0nefogFdI47Qqhdw-dggtgsGzHxiPvr' +
                           't0e5Vh4m5L4lVedSpsCdlMIPOv78-d_N6sAAXPiQ3MYhu5x' +
                           'zhMm8Y_PK8JZnFtfN47vrNlk';

  tokens.standardIdTokenClaims = {
    'sub': '00u1pcla5qYIREDLWCQV',
    'name': 'Saml Jackson',
    'given_name': 'Saml',
    'family_name': 'Jackson',
    'updated_at': 1446153401,
    'email': 'samljackson@okta.com',
    'email_verified': true,
    'ver': 1,
    'iss': 'https://auth-js-test.okta.com',
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

  tokens.standardIdTokenParsed = {
    idToken: tokens.standardIdToken,
    claims: tokens.standardIdTokenClaims,
    expiresAt: 1449699930,
    scopes: ['openid', 'email']
  };

  tokens.modifiedIdToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMHUx' +
                            'cGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1sIEphY2tzb24iL' +
                            'CJnaXZlbl9uYW1lIjoiU2FtbCIsImZhbWlseV9uYW1lIjoiSmFja3' +
                            'NvbiIsInVwZGF0ZWRfYXQiOjE0NDYxNTM0MDEsImVtYWlsIjoic2F' +
                            'tbGphY2tzb25Ab2t0YS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1' +
                            'ZSwidmVyIjoxLCJpc3MiOiJodHRwczovL2F1dGgtanMtdGVzdC5va' +
                            '3RhLmNvbSIsImxvZ2luIjoiYWRtaW5Ab2t0YS5jb20iLCJub25jZS' +
                            'I6ImNjY2NjYyIsImF1ZCI6InNvbWVJZCIsImlhdCI6MTQ0OTY5NjM' +
                            'zMCwiZXhwIjoxNDQ5Njk5OTMwLCJhbXIiOlsia2JhIiwibWZhIiwi' +
                            'cHdkIl0sImp0aSI6IlRSWlQ3UkNpU3ltVHM1VzdSeWgzIiwiYXV0a' +
                            'F90aW1lIjoxNDQ5Njk2MzMwfQ.kXzTzaOYLxsVKhlv0DnOOEZEyUw' +
                            'Y2MYFVvt3g7ebIZPrvSFfUPfhIxGAlmNWobGo8e7FpFL9Hpip2bVx' +
                            'ZZNT4eITptbFv5QA5TzaIudVsMhpngCnqzCwNXen9yEUtne61I6AS' +
                            'uXFM_z14ll2Pb0h4mROkionwdApAVARe5I5fVc';
                            
  tokens.modifiedIdTokenClaims = {
    'sub': '00u1pcla5qYIREDLWCQV',
    'name': 'Saml Jackson',
    'given_name': 'Saml',
    'family_name': 'Jackson',
    'updated_at': 1446153401,
    'email': 'samljackson@okta.com',
    'email_verified': true,
    'ver': 1,
    'iss': 'https://auth-js-test.okta.com',
    'login': 'admin@okta.com',
    'nonce': 'cccccc',
    'aud': 'someId',
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

  tokens.standardAccessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXIiOj' +
                               'EsImp0aSI6IkFULnJ2Ym5TNGlXdTJhRE5jYTNid1RmMEg5Z' +
                               'VdjV2xsS1FlaU5ZX1ZlSW1NWkEiLCJpc3MiOiJodHRwczov' +
                               'L2xib3lldHRlLnRyZXhjbG91ZC5jb20vYXMvb3JzMXJnM3p' +
                               '5YzhtdlZUSk8wZzciLCJhdWQiOiJodHRwczovL2xib3lldH' +
                               'RlLnRyZXhjbG91ZC5jb20vYXMvb3JzMXJnM3p5YzhtdlZUS' +
                               'k8wZzciLCJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIs' +
                               'ImlhdCI6MTQ2ODQ2NzY0NywiZXhwIjoxNDY4NDcxMjQ3LCJ' +
                               'jaWQiOiJQZjBhaWZyaFladTF2MFAxYkZGeiIsInVpZCI6Ij' +
                               'AwdTFwY2xhNXFZSVJFRExXQ1FWIiwic2NwIjpbIm9wZW5pZ' +
                               'CIsImVtYWlsIl19.ziKfS8IjSdOdTHCZllTDnLFdE96U9bS' +
                               'IsJzI0MQ0zlnM2QiiA7nvS54k6Xy78ebnkJvmeMCctjXVKk' +
                               'JOEhR6vs11qVmIgbwZ4--MqUIRU3WoFEsr0muLl039QrUa1' +
                               'EQ9-Ua9rPOMaO0pFC6h2lfB_HfzGifXATKsN-wLdxk6cgA';

  tokens.standardAccessTokenParsed = {
    accessToken: tokens.standardAccessToken,
    expiresAt: 1449703529, // assuming time = 1449699929
    scopes: ['openid', 'email'],
    tokenType: 'Bearer'
  };

  /*
  {
    'sub': '00u1pcla5qYIREDLWCQV',
    'name': 'Saml Jackson',
    'given_name': 'Saml',
    'family_name': 'Jackson',
    'updated_at': 1446153401,
    'email': 'samljackson@okta.com',
    'email_verified': true,
    'ver': 1,
    'iss': 'https://auth-js-test.okta.com',
    'login': 'admin@okta.com',
    'nonce': standardNonce,
    'aud': 'NPSfOkH5eZrTy8PMDlvx',
    'iat': 2449696330,
    'exp': 1449699930,
    'amr': [
      'kba',
      'mfa',
      'pwd'
    ],
    'jti': 'TRZT7RCiSymTs5W7Ryh3',
    'auth_time': 1449696330
  }
  */
  tokens.expiredBeforeIssuedToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzd' +
                           'WIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1s' +
                           'IEphY2tzb24iLCJnaXZlbl9uYW1lIjoiU2FtbCIsImZhbWlseV9' +
                           'uYW1lIjoiSmFja3NvbiIsInVwZGF0ZWRfYXQiOjE0NDYxNTM0MD' +
                           'EsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb20iLCJlbWFpb' +
                           'F92ZXJpZmllZCI6dHJ1ZSwidmVyIjoxLCJpc3MiOiJodHRwczov' +
                           'L2F1dGgtanMtdGVzdC5va3RhLmNvbSIsImxvZ2luIjoiYWRtaW5' +
                           'Ab2t0YS5jb20iLCJub25jZSI6ImFhYWFhYWFhYWFhYWFhYWFhYW' +
                           'FhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY' +
                           'WFhYWFhYWEiLCJhdWQiOiJOUFNmT2tINWVaclR5OFBNRGx2eCIs' +
                           'ImlhdCI6MjQ0OTY5NjMzMCwiZXhwIjoxNDQ5Njk5OTMwLCJhbXI' +
                           'iOlsia2JhIiwibWZhIiwicHdkIl0sImp0aSI6IlRSWlQ3UkNpU3' +
                           'ltVHM1VzdSeWgzIiwiYXV0aF90aW1lIjoxNDQ5Njk2MzMwfQ.o1' +
                           '5xo_fc3Xc-KLxjyD5HxgQcmuVOxRAlcATa8HDzZv04g3CmrgdFN' +
                           '7W2smjXDgBXFPBFLcgpiDqDioAfnMC6KI0G9a2tJMTjwBLwtYMh' +
                           'KZsa4srVE0uXiqdiyiljZ692gdXbwBXgWNIA2PWMrIagxWiqYCn' +
                           'fAJcS7TCE611eg-c';

  tokens.standardAuthorizationCode = '35cFyfgCU2u0a1EzAqbO';

  return tokens;
});
