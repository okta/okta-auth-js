require('../util/webcrypto').polyFill();

var OktaAuth = require('OktaAuth');
var util = require('../util/util');

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
    expect(code.length).toBeGreaterThan(42);
    expect(encodeURIComponent(code)).toBe(code);
  }

  describe('generateVerifier', function() {

    it('produces a valid code', function() {
      var code = authClient.pkce.generateVerifier();
      validateVerifier(code);
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

  describe('exchangeForToken', function() {

    // TODO
    xit('makes requests', function() {
      util.itMakesCorrectRequestResponse({
        title: 'attaches fingerprint to signIn requests if sendFingerprint is true',
        setup: {
          uri: 'http://example.okta.com',
          calls: [
            {
              request: {
                method: 'post',
                uri: '/api/v1/authn',
                data: { username: 'not', password: 'real' },
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'X-Okta-User-Agent-Extended': 'okta-auth-js-' + packageJson.version,
                  'X-Device-Fingerprint': 'ABCD'
                }
              },
              response: 'success'
            }
          ]
        },
        execute: function (test) {
          return setup({ authClient: test.oa }).signIn({
            username: 'not',
            password: 'real',
            sendFingerprint: true
          });
        }
    })
  });
});
});