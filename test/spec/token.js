define(function(require) {
  var OktaAuth = require('OktaAuth');
  var tokens = require('../util/tokens');
  var oauthUtil = require('../util/oauthUtil');

  describe('token.decode', function () {

    function setupSync() {
      return new OktaAuth({ url: 'http://example.okta.com' });
    }

    it('correctly decodes a token', function () {
      var oa = setupSync();
      var decodedToken = oa.token.decode(tokens.unicodeToken);
      expect(decodedToken).toDeepEqual(tokens.unicodeDecoded);
    });

    it('throws an error for a malformed token', function () {
      var oa = setupSync();
      try {
        oa.token.decode('malformedToken');
        // Should never hit this
        expect(true).toBe(false);
      } catch (e) {
        expect(e.name).toEqual('AuthSdkError');
        expect(e.errorSummary).toBeDefined();
      }
    });
  });

  describe('token.getWithoutPrompt', function () {
    it('returns id_token using sessionToken', function (done) {
      return oauthUtil.setupFrame({
        oktaAuthArgs: {
          url: 'https://lboyette.trexcloud.com',
          clientId: 'NPSfOkH5eZrTy8PMDlvx',
          redirectUri: 'https://lboyette.trexcloud.com/redirect'
        },
        getWithoutPromptArgs: {
          sessionToken: 'testSessionToken'
        },
        postMessageSrc: {
          baseUri: 'https://lboyette.trexcloud.com/oauth2/v1/authorize',
          queryParams: {
            'client_id': 'NPSfOkH5eZrTy8PMDlvx',
            'redirect_uri': 'https://lboyette.trexcloud.com/redirect',
            'response_type': 'id_token',
            'response_mode': 'okta_post_message',
            'state': oauthUtil.mockedState,
            'nonce': oauthUtil.mockedNonce,
            'scope': 'openid email',
            'prompt': 'none',
            'sessionToken': 'testSessionToken'
          }
        }
      })
      .fin(function() {
        done();
      });
    });
  });
});
