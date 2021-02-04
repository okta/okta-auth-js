/* global btoa */
import { OktaAuth, AccessToken } from '@okta/okta-auth-js';
import util from '@okta/test.support/util';
import http from '../../../lib/http';

function setupSync(options?) {
  options = Object.assign({ issuer: 'http://example.okta.com', pkce: false }, options);
  return new OktaAuth(options);
}

function createAccessToken(strValue): AccessToken {
  return {
    accessToken: strValue,
    claims: {
      sub: ''
    },
    value: strValue,
    userinfoUrl: '',
    authorizeUrl: '',
    tokenType: 'accessToken',
    expiresAt: 0,
    scopes: []
  };
}

describe('token.revoke', function() {
  it('throws if token is not passed', function() {
    var oa = setupSync();
    return oa.token.revoke(undefined as AccessToken)
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A valid access or refresh token object is required');
      });
  });
  it('throws if invalid token is passed', function() {
    var oa = setupSync();
    var accessToken: unknown = { foo: 'bar' };
    return oa.token.revoke(accessToken as AccessToken)
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A valid access or refresh token object is required');
      });
  });
  it('throws if clientId is not set', function() {
    var oa = setupSync();
    var accessToken = createAccessToken('fake');
    return oa.token.revoke(accessToken)
      .catch(function(err) {
        util.assertAuthSdkError(err, 'A clientId must be specified in the OktaAuth constructor to revoke a token');
      });
  });
  it('makes a POST to /v1/revoke', function() {
    spyOn(http, 'post').and.returnValue(Promise.resolve());
    var clientId = 'fake-client-id';
    var oa = setupSync({ clientId: clientId });
    var accessToken = createAccessToken('fake/ &token');
    return oa.token.revoke(accessToken)
      .then(function() {
        expect(http.post).toHaveBeenCalledWith(oa, 
          'http://example.okta.com/oauth2/v1/revoke', 
          'token_type_hint=access_token&token=fake%2F%20%26token', {
            headers: {
              'Authorization': 'Basic ' + btoa(clientId),
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
      });
  });
  it('will throw if http.post rejects', function() {
    var testError = new Error('test error');
    spyOn(http, 'post').and.callFake(function() {
      return Promise.reject(testError);
    });
    var clientId = 'fake-client-id';
    var oa = setupSync({ clientId: clientId });
    var accessToken = createAccessToken('fake/ &token');
    return oa.token.revoke(accessToken)
      .catch(function(err) {
        expect(err).toBe(testError);
      });
  });
});
