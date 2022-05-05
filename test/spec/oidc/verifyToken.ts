/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


const modulesToMock = {
  features: '../../../lib/features',
  validateClaims: '../../../lib/oidc/util/validateClaims',
  decodeToken: '../../../lib/oidc/decodeToken',
  wellKnown: '../../../lib/oidc/endpoints/well-known',
  crypto: '../../../lib/crypto'
};

const mocked = {
  validateClaims: jest.fn(),
  decodeToken: jest.fn(),
  getWellKnown: jest.fn(),
  getKey: jest.fn(),
  verifyToken: jest.fn(),
  getOidcHash: jest.fn(),
  isTokenVerifySupported: jest.fn()
};

const original = {
  features: jest.requireActual(modulesToMock.features),
  validateClaims: jest.requireActual(modulesToMock.validateClaims).validateClaims,
  decodeToken: jest.requireActual(modulesToMock.decodeToken).decodeToken
};

jest.doMock(modulesToMock.validateClaims, () => {
  return {
    validateClaims: mocked.validateClaims
  };
});

jest.doMock(modulesToMock.decodeToken, () => {
  return {
    decodeToken: mocked.decodeToken
  };
});

jest.doMock(modulesToMock.wellKnown, () => {
  return {
    getKey: mocked.getKey,
    getWellKnown: mocked.getWellKnown
  };
});

jest.doMock(modulesToMock.crypto, () => {
  return {
    verifyToken: mocked.verifyToken,
    getOidcHash: mocked.getOidcHash
  };
});

jest.doMock(modulesToMock.features, () => {
  return Object.assign({}, original.features, {
    isTokenVerifySupported: mocked.isTokenVerifySupported
  });
});

import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/jest/util';
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
    mocked.decodeToken.mockImplementation(original.decodeToken);
    mocked.validateClaims.mockImplementation(original.validateClaims);
    mocked.getWellKnown.mockReturnValue(Promise.resolve({
      issuer: tokens.standardIdTokenParsed.issuer
    }));
    mocked.getKey.mockReturnValue(Promise.resolve('fake-test-key'));
    mocked.verifyToken.mockReturnValue(Promise.resolve(true));
    mocked.isTokenVerifySupported.mockReturnValue(true);
    util.warpToUnixTime(1449699929);
    validationParams = {
      clientId: tokens.standardIdTokenParsed.clientId,
      issuer: tokens.standardIdTokenParsed.issuer
    };
    client = setupSync();
    oauthUtil.loadWellKnownAndKeysCache(client);
  });
  afterEach(() => {
    Object.keys(mocked).forEach(key => {
      mocked[key].mockReset();
    });
  });
  describe('decodeToken', () => {
    it('passes the idToken string to decodeToken', async () => {
      await client.token.verify(tokens.standardIdTokenParsed, validationParams);
      expect(mocked.decodeToken).toHaveBeenCalledWith(tokens.standardIdTokenParsed.idToken);
    });
    it('will throw errors from decodeToken', async () => {
      const error = new Error('a fake test error');
      mocked.decodeToken.mockImplementation(() => {
        throw error;
      });
      await expect(client.token.verify(tokens.standardIdTokenParsed, validationParams)).rejects.toThrow(error);
    });
  });
  describe('validationOptions', () => {
    describe('defaults', () => {
      it('issuer: will use well-known endpoint', async () => {
        client = setupSync({
          issuer: 'http://some-proxy'
        });
        await client.token.verify(tokens.standardIdTokenParsed, { clientId: tokens.standardIdTokenParsed.clientId });
        expect(mocked.validateClaims.mock.calls[0][2].issuer).toBe(tokens.standardIdTokenParsed.issuer);
      });
      it('clientId: will use sdk option', async () => {
        client = setupSync({
          clientId: tokens.standardIdTokenParsed.clientId,
        });
        await client.token.verify(tokens.standardIdTokenParsed, undefined);
        expect(mocked.validateClaims.mock.calls[0][2].clientId).toBe(tokens.standardIdTokenParsed.clientId);
      });
      it('ignoreSignature: will use sdk option', async () => {
        client = setupSync({
          clientId: tokens.standardIdTokenParsed.clientId,
          ignoreSignature: true
        });
        await client.token.verify(tokens.standardIdTokenParsed, undefined);
        expect(mocked.validateClaims.mock.calls[0][2].ignoreSignature).toBe(true);
      });
    });
    it('can override ignoreSignature by passing validationParams', async () => {
      const { issuer, clientId } = tokens.standardIdTokenParsed;
      client = setupSync({
        issuer,
        clientId,
        ignoreSignature: false
      });
      await client.token.verify(tokens.standardIdTokenParsed, {
        ignoreSignature: true
      });
      expect(mocked.validateClaims.mock.calls[0][2]).toEqual({
        issuer,
        clientId,
        ignoreSignature: true
      });
    });

    it('will always use issuer from well-known openid-configuration', async () => {
      const { clientId, issuer } = tokens.standardIdTokenParsed;
      client = setupSync({
        clientId,
        issuer: 'http://configured-issuer',
        ignoreSignature: true
      });
      mocked.getWellKnown.mockReturnValue(Promise.resolve({
        issuer
      }));
      await client.token.verify(tokens.standardIdTokenParsed, {
        issuer: 'http://cannot-be-overridden'
      });
      expect(mocked.validateClaims.mock.calls[0][2]).toEqual({
        issuer,
        clientId,
        ignoreSignature: true
      });
    });
  });

  describe('getKey', () => {
    it('passes the issuer from the token', async () => {
      const issuer = 'http://fake-for-my-test';
      const idToken = {
        issuer,
        idToken: 'something-or-other'
      };
      mocked.decodeToken.mockReturnValue({ header: {} });
      mocked.validateClaims.mockReturnValue(null);
      const res = await client.token.verify(idToken, validationParams);
      expect(res).toBe(idToken);
      expect(mocked.getKey.mock.calls[0][1]).toBe(issuer);
    });

    it('passes the kid from the token header', async () => {
      const issuer = 'http://fake-for-my-test';
      const idToken = {
        issuer,
        idToken: 'something-or-other'
      };
      const kid = 'my-fake-kid';
      mocked.decodeToken.mockReturnValue({ header: { kid } });
      mocked.validateClaims.mockReturnValue(null);
      const res = await client.token.verify(idToken, validationParams);
      expect(res).toBe(idToken);
      expect(mocked.getKey.mock.calls[0][2]).toBe(kid);
    });

    it('can throw', async () => {
      const error = new Error('my-fake-error');
      mocked.getKey.mockImplementation(() => {
        throw error;
      });
      await expect(client.token.verify(tokens.standardIdTokenParsed, validationParams)).rejects.toThrow(error);
    });
  });

  describe('crypto.verifyToken', () => {
    it('will skip crypto.verify if `ignoreSignature` is true', async () => {
      validationParams.ignoreSignature = true;
      const res = await client.token.verify(tokens.standardIdTokenParsed, validationParams);
      expect(mocked.verifyToken).not.toHaveBeenCalled();
      expect(res).toBe(tokens.standardIdTokenParsed);
    });
    it('will skip crypto.verify if `isTokenVerifySupported` is fales', async () => {
      jest.spyOn(client.features, 'isTokenVerifySupported').mockReturnValue(false);
      await client.token.verify(tokens.standardIdTokenParsed, validationParams);
      expect(mocked.verifyToken).not.toHaveBeenCalled();
    });
    it('passes the idToken string and well-known key', async () => {
      const { idToken } = tokens.standardIdTokenParsed;
      const key = 'my-fake-key';
      mocked.getKey.mockReturnValue(Promise.resolve(key));
      await client.token.verify(tokens.standardIdTokenParsed, validationParams);
      expect(mocked.verifyToken).toHaveBeenCalledWith(idToken, key);
    });
    it('throws if sdkCrypto.verifyToken returns false', async () => {
      mocked.verifyToken.mockReturnValue(Promise.resolve(false));
      await expect(client.token.verify(tokens.standardIdTokenParsed, validationParams)).rejects.toThrow('The token signature is not valid');
    });
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
      validationParams.accessToken = tokens.standardAccessToken;
      return client.token.verify(idToken, validationParams)
      .then(function(res) {
        expect(res).toEqual(idToken);
        expect(sdkCrypto.getOidcHash).toHaveBeenCalledWith(tokens.standardAccessToken);
      });
    });

    it('throws if idToken at_hash claim does not match accessToken', () => {
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
      validationParams.accessToken = tokens.standardAccessToken;
      delete idToken.claims.at_hash;
      return client.token.verify(idToken, validationParams)
      .then(function(res) {
        expect(res).toEqual(idToken);
        expect(sdkCrypto.getOidcHash).not.toHaveBeenCalled();
      });
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
    it('throws if token is not an idToken', function() {
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
      mocked.getWellKnown.mockReturnValue(Promise.resolve({
        issuer: 'http://invalidissuer.example.com'
      }));
      return expectError([tokens.standardIdTokenParsed, validationParams],
        'The issuer [https://auth-js-test.okta.com] does not match [http://invalidissuer.example.com]');
    });
    it('expired before issued', function() {
      return expectError([tokens.expiredBeforeIssuedIdTokenParsed, validationParams],
        'The JWT expired before it was issued');
    });
  });
});

