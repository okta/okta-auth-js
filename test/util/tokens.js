/* eslint max-statements:[2,24] */

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

tokens.standardIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE0i' +
  'fQ.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1sIEphY2tzb24iLCJnaXZlbl9uYW1lIjoiU2FtbCIsImZhbWlseV9u' +
  'YW1lIjoiSmFja3NvbiIsInVwZGF0ZWRfYXQiOjE0NDYxNTM0MDEsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb20iLCJlbWFpbF92ZXJpZml' +
  'lZCI6dHJ1ZSwidmVyIjoxLCJpc3MiOiJodHRwczovL2F1dGgtanMtdGVzdC5va3RhLmNvbSIsImxvZ2luIjoiYWRtaW5Ab2t0YS5jb20iLCJub2' +
  '5jZSI6ImFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWEiLCJhdWQiOiJOUFNmT' +
  '2tINWVaclR5OFBNRGx2eCIsImlhdCI6MTQ0OTY5NjMzMCwiZXhwIjoxNDQ5Njk5OTMwLCJhbXIiOlsia2JhIiwibWZhIiwicHdkIl0sImp0aSI6' +
  'IlRSWlQ3UkNpU3ltVHM1VzdSeWgzIiwiYXV0aF90aW1lIjoxNDQ5Njk2MzMwfQ.tdspicRE-0IrFKwjCT2Uo2gExQyTAftcp4cuA3iIF6_uYiqQ' +
  '9Q4SZHCjMbuWdXrUSM-_UkDpD6sbG_ZRcdZQJ7geeIEjKpV4x792iiP_f1H-HLbAMIDWynp5FR4QQO1Q4ndNOwIsrUqf06vYazz9ildQde2uOTw' +
  'caUCsz2M0lSU';

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
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
  issuer: 'https://auth-js-test.okta.com',
  clientId: 'NPSfOkH5eZrTy8PMDlvx'
};

// Uses modified nonce for testing simultaneous iframes
tokens.standardIdToken2 = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE0' +
  'ifQ.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1sIEphY2tzb24iLCJnaXZlbl9uYW1lIjoiU2FtbCIsImZhbWlseV9' +
  'uYW1lIjoiSmFja3NvbiIsInVwZGF0ZWRfYXQiOjE0NDYxNTM0MDEsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb20iLCJlbWFpbF92ZXJpZm' +
  'llZCI6dHJ1ZSwidmVyIjoxLCJpc3MiOiJodHRwczovL2F1dGgtanMtdGVzdC5va3RhLmNvbSIsImxvZ2luIjoiYWRtaW5Ab2t0YS5jb20iLCJub' +
  '25jZSI6ImJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmIiLCJhdWQiOiJOUFNm' +
  'T2tINWVaclR5OFBNRGx2eCIsImlhdCI6MTQ0OTY5NjMzMCwiZXhwIjoxNDQ5Njk5OTMwLCJhbXIiOlsia2JhIiwibWZhIiwicHdkIl0sImp0aSI' +
  '6IlRSWlQ3UkNpU3ltVHM1VzdSeWgzIiwiYXV0aF90aW1lIjoxNDQ5Njk2MzMwfQ.XABmqTp0TiXKu-BuvZ6XgJj11LQxXQGcludepzm71zSB38E' +
  '6Td69ztugF-SVrGk_iD_k4n-lpnyfnbQt_rGFuUmAn_PsXC8DogAziSVxE96AF6G7X9rpvhnFkdc4wmt8X71oHhDuwiuAh7BrXYdvkCLDEh4Hgw' +
  'Iu4M_1dJg2308';

tokens.standardIdToken2Claims = {
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
  'nonce': 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
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

tokens.standardIdToken2Parsed = {
  idToken: tokens.standardIdToken2,
  claims: tokens.standardIdToken2Claims,
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
  issuer: 'https://auth-js-test.okta.com',
  clientId: 'NPSfOkH5eZrTy8PMDlvx'
};

tokens.expiredBeforeIssuedIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6Vk8xUGNDcFhMOHlHNkljb3ZWY' +
  'TNsYUNveE0ifQ.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1sIEphY2tzb24iLCJnaXZlbl9uYW1lIjoiU2FtbCIsI' +
  'mZhbWlseV9uYW1lIjoiSmFja3NvbiIsInVwZGF0ZWRfYXQiOjE0NDYxNTM0MDEsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb20iLCJlbWFp' +
  'bF92ZXJpZmllZCI6dHJ1ZSwidmVyIjoxLCJpc3MiOiJodHRwczovL2F1dGgtanMtdGVzdC5va3RhLmNvbSIsImxvZ2luIjoiYWRtaW5Ab2t0YS5' +
  'jb20iLCJub25jZSI6ImFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWEiLCJhdW' +
  'QiOiJOUFNmT2tINWVaclR5OFBNRGx2eCIsImlhdCI6MTQ0OTY5NjMzMCwiZXhwIjoxNDQ5NjkwMDAwLCJhbXIiOlsia2JhIiwibWZhIiwicHdkI' +
  'l0sImp0aSI6IlRSWlQ3UkNpU3ltVHM1VzdSeWgzIiwiYXV0aF90aW1lIjoxNDQ5Njk2MzMwfQ.K6jaWgn2pX5bZx0MZBax6Y0JetCDIlJp2iUEY' +
  'PO1teGQGTGIC6qjcKlSyWVlWKTNYGJSHk24NmKa78Idxa4CaWQCaIxP_wvMJv0dQjb5nwVtyPz5X8ez46MYhkwArC2hEl9JVb2jE7ElOW2XvU5x' +
  'TaMRlXLsimDp3XNlnQ8aTiI';

tokens.expiredBeforeIssuedIdTokenClaims = {
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
  'exp': 1449690000,
  'amr': [
    'kba',
    'mfa',
    'pwd'
  ],
  'jti': 'TRZT7RCiSymTs5W7Ryh3',
  'auth_time': 1449696330
};

tokens.expiredBeforeIssuedIdTokenParsed = {
  idToken: tokens.expiredBeforeIssuedIdToken,
  claims: tokens.expiredBeforeIssuedIdTokenClaims,
  expiresAt: 1449690000,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
  issuer: 'https://auth-js-test.okta.com',
  clientId: 'NPSfOkH5eZrTy8PMDlvx'
};

tokens.authServerIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE' +
  '0ifQ.eyJzdWIiOiIwMHVrb2VFcUlvZ2lGSHBEZTBnMyIsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb20iLCJ2ZXIiOjEsImlzcyI6Imh0dH' +
  'BzOi8vYXV0aC1qcy10ZXN0Lm9rdGEuY29tL29hdXRoMi9hdXM4YXVzNzZxOGlwaHVwRDBoNyIsImF1ZCI6Ik5QU2ZPa0g1ZVpyVHk4UE1EbHZ4I' +
  'iwiaWF0IjoxNDQ5Njk2MzMwLCJleHAiOjE0NDk2OTk5MzAsImp0aSI6IklELlNpOUtxR3RTV2hLQnJzRGh2bEV0QVItR3lkc2V1Y1VHOXhXdVdL' +
  'MUpoNTgiLCJhbXIiOlsicHdkIl0sImlkcCI6IjAwb2tucjFDSGxXYUF3d2dvMGczIiwibm9uY2UiOiJhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWF' +
  'hYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1dGhfdGltZSI6MTQ0OTY5Nj' +
  'MzMH0.jy6U2EFPXrwEG7902H2vbcgkHdj7gazYo5TTS1L8jFK6pVSAfw24N1l99oxCJowRn6YnTkV8HIeR2xuBOH6rGGntSFiDl8_GoyX1xM42i' +
  'BH6R1lF9iPWhYBQg0EGKYndCXv215SaHNcxP9D3PEKq78EdUIy9EG9X37lbvVRcbBc';

tokens.authServerIdTokenClaims = {
  'sub': '00ukoeEqIogiFHpDe0g3',
  'email': 'samljackson@okta.com',
  'ver': 1,
  'iss': 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
  'aud': 'NPSfOkH5eZrTy8PMDlvx',
  'iat': 1449696330,
  'exp': 1449699930,
  'jti': 'ID.Si9KqGtSWhKBrsDhvlEtAR-GydseucUG9xWuWK1Jh58',
  'amr': [
    'pwd'
  ],
  'idp': '00oknr1CHlWaAwwgo0g3',
  'nonce': 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'email_verified': true,
  'auth_time': 1449696330
};

tokens.authServerIdTokenParsed = {
  idToken: tokens.authServerIdToken,
  claims: tokens.authServerIdTokenClaims,
  expiresAt: 1449699930,
  scopes: ['openid', 'email'],
  authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
  issuer: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7',
  clientId: 'NPSfOkH5eZrTy8PMDlvx'
};

tokens.modifiedIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE0i' +
  'fQ.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1sIEphY2tzb24iLCJnaXZlbl9uYW1lIjoiU2FtbCIsImZhbWlseV9u' +
  'YW1lIjoiSmFja3NvbiIsInVwZGF0ZWRfYXQiOjE0NDYxNTM0MDEsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb20iLCJlbWFpbF92ZXJpZml' +
  'lZCI6dHJ1ZSwidmVyIjoxLCJpc3MiOiJodHRwczovL2F1dGgtanMtdGVzdC5va3RhLmNvbSIsImxvZ2luIjoiYWRtaW5Ab2t0YS5jb20iLCJub2' +
  '5jZSI6ImNjY2NjYyIsImF1ZCI6InNvbWVJZCIsImlhdCI6MTQ0OTY5NjMzMCwiZXhwIjoxNDQ5Njk5OTMwLCJhbXIiOlsia2JhIiwibWZhIiwic' +
  'HdkIl0sImp0aSI6IlRSWlQ3UkNpU3ltVHM1VzdSeWgzIiwiYXV0aF90aW1lIjoxNDQ5Njk2MzMwfQ.lVt8eAGGGUBpyrkTb2aq21wC-d-GEV-SZ' +
  'b8fCupQheQ4GOUEh4Gu2VzRuqFwORYHp177H6b91r7Z9E4L0RbkCLe_F7BmM3JD-BxziFVzIPzKBDZdkg5M12EWomxTd9n-lyYQuE4yA2lOG_W6' +
  '6ldl_qLOvGlLTv52mJhOBQxW8ic';

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
  tokenType: 'Bearer',
  authorizeUrl: 'https://auth-js-test.okta.com/oauth2/v1/authorize',
  userinfoUrl: 'https://auth-js-test.okta.com/oauth2/v1/userinfo'
};

tokens.authServerAccessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXIiOjEsImp' +
                                '0aSI6IkFULl8wWTNCYkV5X2Y0MlNjUzJWT3drc1RwOEI4UW9qWVM' +
                                'zYk10WENERnJ4aDgiLCJpc3MiOiJodHRwczovL2F1dGgtanMtdGV' +
                                'zdC5va3RhLmNvbS9vYXV0aDIvYXVzOGF1czc2cThpcGh1cEQwaDc' +
                                'iLCJhdWQiOiJodHRwOi8vZXhhbXBsZS5jb20iLCJzdWIiOiJzYW1' +
                                'samFja3NvbkBva3RhLmNvbSIsImlhdCI6MTQ0OTY5OTkyOSwiZXh' +
                                'wIjoxNDQ5NzAzNTI5LCJjaWQiOiJnTHpGMERoalFJR0NUNHFPMFN' +
                                'NQiIsInVpZCI6IjAwdWtvZUVxSW9naUZIcERlMGczIiwic2NwIjp' +
                                'bIm9wZW5pZCIsImVtYWlsIl19.sD7CmiX1JCrngJFbYid5za78-c' +
                                'vOdVEFONqx7m5Ar8OK3MWPuui9wbzBvyiBR70rCuKzb0gSZb96N0' +
                                'EE8wXbgYjzGH5T6dazwgGfGmVf2PTa1pKfPew7f_XKE_t1O_tJ9C' +
                                'h9gY9Z3xd92ac407ZIOHkabLvZ0-45ANM3Gm0LC0c';

tokens.authServerAccessTokenParsed = {
  accessToken: tokens.authServerAccessToken,
  expiresAt: 1449703529, // assuming time = 1449699929
  scopes: ['openid', 'email'],
  tokenType: 'Bearer',
  authorizeUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/authorize',
  userinfoUrl: 'https://auth-js-test.okta.com/oauth2/aus8aus76q8iphupD0h7/v1/userinfo'
};

tokens.standardAuthorizationCode = '35cFyfgCU2u0a1EzAqbO';

tokens.standardKey = {
  alg: 'RS256',
  kty: 'RSA',
  n: '3ZWrUY0Y6IKN1qI4BhxR2C7oHVFgGPYkd38uGq1jQNSqEvJFcN93CYm16_G78FAFKWqwsJb3Wx-nbxDn6LtP4AhULB1H0K0g7_jLklDAHvI8' +
    'yhOKlvoyvsUFPWtNxlJyh5JJXvkNKV_4Oo12e69f8QCuQ6NpEPl-cSvXIqUYBCs',
  e: 'AQAB',
  use: 'sig',
  kid: 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM'
};

module.exports = tokens;
