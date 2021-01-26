import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import oauthUtil from '@okta/test.support/oauthUtil';
import * as sdkCrypto from '../../../lib/crypto';

const _ = require('lodash');

function setupSync(options?) {
  options = Object.assign({ issuer: 'http://example.okta.com', pkce: false }, options);
  return new OktaAuth(options);
}

describe('token.verify', function() {
  var validationParams;
  var client;
  beforeEach(() => {
    validationParams = {
      clientId: tokens.standardIdTokenParsed.clientId,
      issuer: tokens.standardIdTokenParsed.issuer
    };
    client = setupSync();
  });

  describe('with access token', () => {
    var idToken;
    var atHash;

    beforeEach(() => {
      atHash = 'Gryuqew1_irUBmgZAncMsA'; // based on tokens.standardAccessToken

      // Mock out sdk crypto
      jest.spyOn(client.features, 'isTokenVerifySupported').mockReturnValue(true);
      jest.spyOn(sdkCrypto, 'verifyToken').mockReturnValue(Promise.resolve(true));
      jest.spyOn(sdkCrypto, 'getOidcHash').mockReturnValue(Promise.resolve(atHash));

      // Return modified idToken
      idToken = _.cloneDeep(tokens.standardIdTokenParsed);
      idToken.claims.at_hash = atHash;
    });

    it('verifies idToken at_hash claim against accessToken', () => {
      util.warpToUnixTime(1449699929);
      oauthUtil.loadWellKnownAndKeysCache(client);
      validationParams.accessToken = tokens.standardAccessToken;
      return client.token.verify(idToken, validationParams)
      .then(function(res) {
        expect(res).toEqual(idToken);
        expect(sdkCrypto.getOidcHash).toHaveBeenCalledWith(tokens.standardAccessToken);
      });
    });

    it('throws if idToken at_hash claim does not match accessToken', () => {
      util.warpToUnixTime(1449699929);
      oauthUtil.loadWellKnownAndKeysCache(client);
      validationParams.accessToken = tokens.standardAccessToken;
      idToken.claims.at_hash = 'other_hash';
      return client.token.verify(idToken, validationParams)
      .then(function() {
        expect('not to be hit').toEqual(true);
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, 'Token hash verification failed');
      });
    });

    it('skips verification if idToken does not have at_hash claim', () => {
      util.warpToUnixTime(1449699929);
      oauthUtil.loadWellKnownAndKeysCache(client);
      validationParams.accessToken = tokens.standardAccessToken;
      delete idToken.claims.at_hash;
      return client.token.verify(idToken, validationParams)
      .then(function(res) {
        expect(res).toEqual(idToken);
        expect(sdkCrypto.getOidcHash).not.toHaveBeenCalled();
      });
    });
  });

  it('verifies a valid idToken with nonce', function() {
    util.warpToUnixTime(1449699929);
    oauthUtil.loadWellKnownAndKeysCache(client);
    validationParams.nonce = tokens.standardIdTokenParsed.nonce;
    return client.token.verify(tokens.standardIdTokenParsed, validationParams)
    .then(function(res) {
      expect(res).toEqual(tokens.standardIdTokenParsed);
    });
  });
  it('verifies a valid idToken without nonce or accessToken', function() {
    util.warpToUnixTime(1449699929);
    oauthUtil.loadWellKnownAndKeysCache(client);
    return client.token.verify(tokens.standardIdTokenParsed, validationParams)
    .then(function(res) {
      expect(res).toEqual(tokens.standardIdTokenParsed);
    });
  });
  it('validationParams are optional', () => {
    util.warpToUnixTime(1449699929);
    client = setupSync({
      issuer: tokens.standardIdTokenParsed.issuer,
      clientId: tokens.standardIdTokenParsed.clientId,
    });
    oauthUtil.loadWellKnownAndKeysCache(client);
    return client.token.verify(tokens.standardIdTokenParsed, undefined)
    .then(function(res) {
      expect(res).toEqual(tokens.standardIdTokenParsed);
    });
  });

  describe('rejects a token', function() {
    beforeEach(function() {
      jest.useFakeTimers();
    });
    afterEach(function() {
      jest.useRealTimers();
    });
    function expectError(verifyArgs, message) {
      return client.token.verify.apply(null, verifyArgs)
      .then(function() {
        expect('not to be hit').toEqual(true);
      })
      .catch(function(err) {
        util.assertAuthSdkError(err, message);
      });
    }

    it('isn\'t an idToken', function() {
      return expectError([tokens.standardAccessTokenParsed],
        'Only idTokens may be verified');
    });
    it('issued in the future', function() {
      util.warpToDistantPast();
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The JWT was issued in the future');
    });
    it('expired', function() {
      util.warpToDistantFuture();
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The JWT expired and is no longer valid');
    });
    it('invalid nonce', function() {
      validationParams.nonce = 'invalidNonce';
      return expectError([tokens.standardIdToken2Parsed, validationParams],
        'OAuth flow response nonce doesn\'t match request nonce');
    });
    it('invalid audience', function() {
      validationParams.clientId = 'invalidAudience';
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The audience [NPSfOkH5eZrTy8PMDlvx] does not match [invalidAudience]');
    });
    it('invalid issuer', function() {
      validationParams.issuer = 'http://invalidissuer.example.com';
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The issuer [https://auth-js-test.okta.com] does not match [http://invalidissuer.example.com]');
    });
    it('expired before issued', function() {
      return expectError([tokens.expiredBeforeIssuedIdTokenParsed, validationParams],
        'The JWT expired before it was issued');
    });
  });
});

