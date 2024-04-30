import 'fake-indexeddb/auto';

import testTokens from '@okta/test.support/tokens';
import { decodeToken } from '../../../lib/oidc/decodeToken';
import * as dpop from '../../../lib/oidc/dpop';
import { AuthSdkError } from '../../../lib/errors';


describe('dpop', () => {
  let ctx: any = {};

  afterEach(() => {
    ctx = {};
  });

  describe('Crypto', () => {
    it('createJwt', async () => {
      const head = {foo: 1};
      const claims = {bar: 1};
      const keyPair = await dpop.generateKeyPair();
      const jwt = await dpop.createJwt(head, claims, keyPair.privateKey);
      expect(typeof jwt).toBe('string');
      const decoded = decodeToken(jwt);
      expect(decoded.header).toEqual(head);
      expect(decoded.payload).toEqual(claims);
    });
  });

  describe('Key Store', () => {
    beforeEach(async () => {
      await dpop.clearAllDPoPKeyPairs();
      indexedDB.deleteDatabase('OktaAuthJs');
    });

    describe('findKeyPair', () => {
      it('will throw when no keyId is provided', async () => {
        const t = async () => await dpop.findKeyPair();
        await expect(t).rejects.toThrowError(AuthSdkError);
        await expect(t).rejects.toThrowError('Unable to locate dpop key pair required for refresh');
      });

      it('will throw when no results are found', async () => {
        const t = async () => await dpop.findKeyPair('foo');
        await expect(t).rejects.toThrowError(AuthSdkError);
        await expect(t).rejects.toThrowError('Unable to locate dpop key pair required for refresh (foo)');
      });

      it('will return keyPair by id', async () => {
        const { keyPair, keyPairId } = await dpop.createDPoPKeyPair();
        const kp = await dpop.findKeyPair(keyPairId);
        expect(keyPair.privateKey).toMatchObject(kp.privateKey);
      });
    });

    describe('clearDPoPKeyPair', () => {
      it('should only delete a single KP when a keyId is provided', async () => {
        const kp1 = await dpop.createDPoPKeyPair();
        const kp2 = await dpop.createDPoPKeyPair();
        await expect(dpop.findKeyPair(kp1.keyPairId)).resolves.toBeDefined();
        await expect(dpop.findKeyPair(kp2.keyPairId)).resolves.toBeDefined();
        await dpop.clearDPoPKeyPair(kp1.keyPairId);
        await expect(dpop.findKeyPair(kp1.keyPairId)).rejects.toThrow();
        await expect(dpop.findKeyPair(kp2.keyPairId)).resolves.toBeDefined();
      });
    });

    describe('clearAllDPoPKeyPairs', () => {
      it('should delete all KPs', async () => {
        const kp1 = await dpop.createDPoPKeyPair();
        const kp2 = await dpop.createDPoPKeyPair();
        await expect(dpop.findKeyPair(kp1.keyPairId)).resolves.toBeDefined();
        await expect(dpop.findKeyPair(kp2.keyPairId)).resolves.toBeDefined();
        await dpop.clearAllDPoPKeyPairs();
        await expect(dpop.findKeyPair(kp1.keyPairId)).rejects.toThrow();
        await expect(dpop.findKeyPair(kp2.keyPairId)).rejects.toThrow();
      });
    });

    describe('clearDPoPKeyPairAfterRevoke', () => {
      it('should clear KP when a valid access token is passed', async () => {
        const { keyPairId } = await dpop.createDPoPKeyPair();
        await expect(dpop.findKeyPair(keyPairId)).resolves.toBeDefined();
        const tokens = {
          accessToken: testTokens.standardAccessTokenParsed
        };
        tokens.accessToken.tokenType = 'DPoP';
        tokens.accessToken.dpopPairId = keyPairId;
        await dpop.clearDPoPKeyPairAfterRevoke('access', tokens);
        await expect(dpop.findKeyPair(keyPairId)).rejects.toThrow();
      });

      it('should clear KP when a valid refresh token is passed', async () => {
        const { keyPairId } = await dpop.createDPoPKeyPair();
        await expect(dpop.findKeyPair(keyPairId)).resolves.toBeDefined();
        const tokens = {
          refreshToken: testTokens.standardRefreshTokenParsed
        };
        tokens.refreshToken.dpopPairId = keyPairId;
        await dpop.clearDPoPKeyPairAfterRevoke('refresh', tokens);
        await expect(dpop.findKeyPair(keyPairId)).rejects.toThrow();
      });

      it('should not clear KP when a both access and refresh tokens exist', async () => {
        const { keyPairId } = await dpop.createDPoPKeyPair();
        await expect(dpop.findKeyPair(keyPairId)).resolves.toBeDefined();
        const tokens = {
          accessToken: testTokens.standardAccessTokenParsed,
          refreshToken: testTokens.standardRefreshTokenParsed
        };
        tokens.accessToken.tokenType = 'DPoP';
        tokens.accessToken.dpopPairId = keyPairId;
        tokens.refreshToken.dpopPairId = keyPairId;
        await dpop.clearDPoPKeyPairAfterRevoke('refresh', tokens);
        await expect(dpop.findKeyPair(keyPairId)).resolves.toBeDefined();
      });
    });
  });

  describe('DPoP Proofs', () => {
    beforeEach(async () => {
      ctx.keyPair = await dpop.generateKeyPair();
    });

    it('proof', async () => {
      const params = {
        keyPair: ctx.keyPair,
        url: '/v1/token',
        method: 'POST'
      };
      const proof = await dpop.generateDPoPProof(params);
      expect(typeof proof).toBe('string');
      const decoded = decodeToken(proof);
      expect(decoded.header).toMatchObject({
        alg: 'RS256',
        typ: 'dpop+jwt',
        jwk: expect.objectContaining({
          kty: expect.any(String),
          e: expect.any(String),
          n: expect.any(String),
        })
      });
      expect(decoded.payload).toMatchObject({
        htm: params.method,
        htu: params.url,
        iat: expect.any(Number),
        jti: expect.any(String)
      });
    });

    it('proof with nonce', async () => {
      const params = {
        keyPair: ctx.keyPair,
        url: '/v1/token',
        method: 'POST',
        nonce: 'nonceuponatime'
      };
      const proof = await dpop.generateDPoPProof(params);
      expect(typeof proof).toBe('string');
      const decoded = decodeToken(proof);
      expect(decoded.header).toMatchObject({
        alg: 'RS256',
        typ: 'dpop+jwt',
        jwk: expect.objectContaining({
          kty: expect.any(String),
          e: expect.any(String),
          n: expect.any(String),
        })
      });
      expect(decoded.payload).toMatchObject({
        htm: params.method,
        htu: params.url,
        iat: expect.any(Number),
        jti: expect.any(String),
        nonce: params.nonce
      });
    });

    it('proof with access token', async () => {
      const params = {
        keyPair: ctx.keyPair,
        url: '/api/some/resource',
        method: 'GET',
        accessToken: testTokens.standardAccessTokenParsed.accessToken
      };
      const proof = await dpop.generateDPoPProof(params);
      expect(typeof proof).toBe('string');
      const decoded = decodeToken(proof);
      expect(decoded.header).toMatchObject({
        alg: 'RS256',
        typ: 'dpop+jwt',
        jwk: expect.objectContaining({
          kty: expect.any(String),
          e: expect.any(String),
          n: expect.any(String),
        })
      });
      expect(decoded.payload).toMatchObject({
        htm: params.method,
        htu: params.url,
        iat: expect.any(Number),
        jti: expect.any(String),
        ath: 'cgQrr9CmOH3UpE-YndQAY4xHmvu18-xZPhYVN6niRh4'    // sha256 of accessToken
      });
    });
  });

});
