jest.mock('cross-fetch');
require('../util/webcrypto').polyFill();

var util = require('../util/util');
var OktaAuth = require('../../lib/browser/browserIndex');
var packageJson = require('../../package.json');
var sdkUtil = require('../../lib/util');

var MIN_VERIFIER_LENGTH = 43;
var MAX_VERIFIER_LENGTH = 128;

describe('pkce', function() {
  var authClient;

  beforeEach(function() {
    authClient = new OktaAuth({
      url: 'https://auth-js-test.okta.com'
    });
  })

  // Code verifier: Random URL-safe string with a minimum length of 43 characters.
  // Code challenge: Base64 URL-encoded SHA-256 hash of the code verifier.

  function validateVerifier(code) {
    expect(code.length).toBeGreaterThan(MIN_VERIFIER_LENGTH - 1);
    expect(code.length).toBeLessThan(MAX_VERIFIER_LENGTH + 1);
    expect(encodeURIComponent(code)).toBe(code);
  }

  describe('generateVerifier', function() {

    it('produces a valid code', function() {
      var code = authClient.pkce.generateVerifier();
      validateVerifier(code);
    });

    it('trims code to maximum length', function() {
      var prefix = sdkUtil.genRandomString(MAX_VERIFIER_LENGTH * 2);
      expect(prefix.length).toBeGreaterThan(MAX_VERIFIER_LENGTH);
      var code = authClient.pkce.generateVerifier(prefix);
      validateVerifier(code);
      expect(code.length).toBe(MAX_VERIFIER_LENGTH);
    });

    it('accepts a prefix', function() {
      var prefix = 'f00';
      var code = authClient.pkce.generateVerifier(prefix);
      expect(code.indexOf(prefix)).toBe(0);
      validateVerifier(code);
    });

    it('if a valid code is provided as prefix, it will be used unchanged', function() {
      var prefix = authClient.pkce.generateVerifier();
      var code = authClient.pkce.generateVerifier(prefix);
      expect(code).toBe(prefix);
    });

  });

  describe('computeChallenge', function() {

    it('creates value that matches server', function() {
      // Values are from okta-core test
      var SAMPLE_CODE_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
      var SAMPLE_CODE_VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

      return authClient.pkce.computeChallenge(SAMPLE_CODE_VERIFIER)
        .then(function(computed) {
          expect(computed).toBe(SAMPLE_CODE_CHALLENGE);
        });
    })

    it('is URL safe', function() {
      var codeVerifier = authClient.pkce.generateVerifier();
      return authClient.pkce.computeChallenge(codeVerifier)
      .then(function(computed) {
        expect(encodeURIComponent(computed)).toBe(computed);
      });  
    })
  });

  describe('getToken', function() {
    var ISSUER = 'http://example.okta.com';
    var REDIRECT_URI = 'http://fake.local';
    var CLIENT_ID = 'fake';
    var endpoint = '/oauth2/v1/token';
    var codeVerifier = 'superfake';
    var authorizationCode = 'notreal';
    var grantType = 'authorization_code';

    util.itMakesCorrectRequestResponse({
      title: 'requests a token',
      setup: {
        uri: ISSUER,
        bypassCrypto: true,
        calls: [
          {
            request: {
              method: 'post',
              uri: endpoint,
              withCredentials: false,
              data: {
                client_id: CLIENT_ID,
                grant_type: grantType,
                redirect_uri: REDIRECT_URI
              },
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version
              }
            },
            response: 'pkce-token-success',
            responseVars: {
              scope: 'also fake',
              accessToken: 'fake access token',
              idToken: util.generateIDToken({
                issuer: ISSUER,
                clientId: CLIENT_ID
              })
            }
          }
        ]
      },
      execute: function (test) {
        return test.oa.pkce.getToken({
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          authorizationCode: authorizationCode,
          codeVerifier: codeVerifier,
          grantType: grantType,
        }, {
          tokenUrl: ISSUER + endpoint
        });
      }
    })
  });

});