import * as nJwt from 'njwt';
import Rasha from 'rasha';
import { advanceTo } from 'jest-date-mock';
import { PEM, INVALID_PEM, JWK, INVALID_JWK } from '@okta/test.support/jwt.mjs';
import { makeJwt } from '../../../lib/crypto/jwt';

describe('JWT', () => {
  describe('makeJwt', () => {
    let generalOptions;
    beforeEach(() => {
      advanceTo(0);
      generalOptions = {
        clientId: 'fake-client-id',
        aud: 'fake/aud',
      };
    });
    function verifyJWT(jwt) {
      expect(jwt.body).toEqual({
        aud: 'fake/aud',
        exp: 300,
        iat: 0,
        iss: 'fake-client-id',
        jti: expect.any(String),
        sub: 'fake-client-id'
      });
      expect(jwt.header).toEqual({
        alg: 'RS256',
        typ: 'JWT'
      });
      expect(jwt.signingKey).toBe(PEM);
      const compactedJwt = jwt.compact();
      return Rasha.export({ jwk: JWK, 'public': true }).then(function (publicKey) {
        const verifiedJwt = nJwt.verify(compactedJwt, publicKey, 'RS256')!;
        expect(verifiedJwt.body).toEqual({
          aud: 'fake/aud',
          jti: expect.any(String),
          iat: 0,
          exp: 300,
          iss: 'fake-client-id',
          sub: 'fake-client-id'
        });
        expect(verifiedJwt.header).toEqual({
          alg: 'RS256',
          typ: 'JWT'
        });
      });
    }

    it('creates a valid JWT using PEM', async () => {
      const jwt = await makeJwt({
        ...generalOptions,
        privateKey: PEM,
      });
      await verifyJWT(jwt);
    });

    it('throws if invalid PEM is passed', async () => {
      await expect(makeJwt({
        ...generalOptions,
        privateKey: INVALID_PEM,
      })).rejects.toThrow('not an RSA PKCS#8 public or private key (wrong format)');
    });

    it('creates a valid JWT using JWK', async () => {
      const jwt = await makeJwt({
        ...generalOptions,
        privateKey: JWK,
      });
      await verifyJWT(jwt);
    });

    it('throws if invalid JWK is passed', async () => {
      await expect(makeJwt({
        ...generalOptions,
        privateKey: INVALID_JWK,
      })).rejects.toThrow('options.jwk.kty must be \'RSA\' for RSA keys');
    });

    it('sets JWK\'s \'kid\' value into JWT header', async () => {
      const jwt = await makeJwt({ 
        ...generalOptions,
        privateKey: {
          ...JWK,
          kid: 'keyId'
        },
      });
      expect(jwt.header).toEqual({
        alg: 'RS256',
        kid: 'keyId',
        typ: 'JWT'
      });
    });

    it('does not set \'kid\' JWT header if \'kid\' was not specified in JWK', async () => {
      const jwt = await makeJwt({
        ...generalOptions,
        privateKey: JWK,
      });
      expect(jwt.header).toEqual({
        alg: 'RS256',
        typ: 'JWT'
      });
    });

  });
});
