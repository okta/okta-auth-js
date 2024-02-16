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

jest.mock('../../../../lib/http', () => {
  const actual = jest.requireActual('../../../../lib/http');
  return {
    httpRequest: actual.httpRequest,
    post: actual.post,
    setRequestHeader: actual.setRequestHeader
  };
});

const mocked = {
  http: require('../../../../lib/http'),
};

import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import util from '@okta/test.support/util';
import { postToTokenEndpoint, postRefreshToken } from '../../../../lib/oidc/endpoints/token';
import factory from '@okta/test.support/factory';
import tokens from '@okta/test.support/tokens';
import { CustomUrls } from '../../../../lib/oidc/types';
import { OAuthError } from '../../../../lib/errors';
import { generateKeyPair } from '../../../../lib/oidc/dpop';
import { decodeToken } from '../../../../lib/oidc';

describe('token endpoint', function() {
  var ISSUER = 'http://example.okta.com';
  var REDIRECT_URI = 'http://fake.local';
  var CLIENT_ID = 'fake';
  var endpoint = '/oauth2/v1/token';
  var codeVerifier = 'superfake';
  var authorizationCode = 'notreal';

  util.itMakesCorrectRequestResponse({
    title: 'requests a token',
    setup: {
      issuer: ISSUER,
      bypassCrypto: true,
      calls: [
        {
          request: {
            method: 'post',
            uri: endpoint,
            withCredentials: false,
            data: {
              client_id: CLIENT_ID,
              grant_type: 'authorization_code',
              redirect_uri: REDIRECT_URI
            },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Okta-User-Agent-Extended': global['USER_AGENT']
            }
          },
          response: 'pkce-token-success',
          responseVars: {
            scope: 'also fake',
            accessToken: 'fake access token',
            idToken: factory.buildIDToken({
              issuer: ISSUER,
              clientId: CLIENT_ID
            })
          }
        }
      ]
    },
    execute: function (test) {
      return postToTokenEndpoint(test.oa, {
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        authorizationCode: authorizationCode,
        codeVerifier: codeVerifier,
      }, {
        tokenUrl: ISSUER + endpoint
      });
    }
  });

  describe('validateOptions', function() {
    var authClient;
    var oauthOptions;

    beforeEach(function() {
      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
      authClient = new OktaAuth({
        issuer: 'https://auth-js-test.okta.com'
      });

      oauthOptions = {
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        authorizationCode: authorizationCode,
        codeVerifier: codeVerifier,
      };
    });

    it('Does not throw if options are valid', async () => {
      var httpRequst = jest.spyOn(mocked.http, 'httpRequest').mockImplementation();
      var urls = {
        tokenUrl: 'http://superfake'
      };
      await postToTokenEndpoint(authClient, oauthOptions, urls);
      expect(httpRequst).toHaveBeenCalled();
    });

    it('Throws if no clientId', async () => {
      oauthOptions.clientId = undefined;
      try {
        await postToTokenEndpoint(authClient, oauthOptions, undefined as unknown as CustomUrls);
      } catch(e) {
        expect(e instanceof AuthSdkError).toBe(true);
        expect((e as Error).message).toBe('A clientId must be specified in the OktaAuth constructor to get a token');
      }
    });

    it('Throws if no redirectUri', async () => {
      oauthOptions.redirectUri = undefined;
      try {
        await postToTokenEndpoint(authClient, oauthOptions, undefined as unknown as CustomUrls);
      } catch(e) {
        expect(e instanceof AuthSdkError).toBe(true);
        expect((e as Error).message).toBe('The redirectUri passed to /authorize must also be passed to /token');
      }
    });

    it('Throws if no authorizationCode', async () => {
      oauthOptions.authorizationCode = undefined;
      try {
        await postToTokenEndpoint(authClient, oauthOptions, undefined as unknown as CustomUrls);
      } catch(e) {
        expect(e instanceof AuthSdkError).toBe(true);
        expect((e as Error).message).toBe('An authorization code (returned from /authorize) must be passed to /token');
      }
    });

    it('Throws if no codeVerifier', async () => {
      oauthOptions.codeVerifier = undefined;
      try {
        await postToTokenEndpoint(authClient, oauthOptions, undefined as unknown as CustomUrls);
      } catch(e) {
        expect(e instanceof AuthSdkError).toBe(true);
        expect((e as Error).message).toBe('The "codeVerifier" (generated and saved by your app) must be passed to /token');
      }
    });

  });

  describe('dpop', () => {
    const ctx: any = {};

    beforeEach(async () => {
      ctx.client = new OktaAuth({
        issuer: 'https://auth-js-test.okta.com',
        dpop: true
      });

      ctx.options = {
        dpop: true,
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        authorizationCode: authorizationCode,
        codeVerifier: codeVerifier,
        dpopKeyPair: await generateKeyPair()
      };

      ctx.urls = {
        tokenUrl: 'http://superfake'
      };

      ctx.refreshToken = tokens.standardRefreshTokenParsed;
    });

    describe('postToTokenEndpoint', () => {
      it('throws if no key pair is provided', async () => {
        const { client, options, urls } = ctx;
        jest.spyOn(mocked.http, 'httpRequest').mockImplementation();
        options.dpopKeyPair = undefined;
        await expect(async () => await postToTokenEndpoint(client, options, urls)).rejects.toThrow();
      });
  
      it('handles dpop nonce error (happpy path)', async () => {
        const { client, options, urls } = ctx;
        const httpSpy = jest.spyOn(mocked.http, 'httpRequest')
          .mockRejectedValueOnce(new OAuthError('use_dpop_nonce',
            'Authorization server requires nonce in DPoP proof.',
            { status: 400, responseText: 'Bad Request', headers: { 'dpop-nonce': 'nonceuponatime' }})
          ).mockImplementation();
        await postToTokenEndpoint(client, options, urls);
        expect(httpSpy).toHaveBeenCalledTimes(2);
        const firstCall = (httpSpy.mock.calls[0][1] as any).headers.DPoP;
        const secondCall = (httpSpy.mock.calls[1][1] as any).headers.DPoP;
        expect(firstCall).not.toEqual(secondCall);
        expect(decodeToken(firstCall)).toMatchObject({
          header: {
            alg: 'RS256',
            typ: 'dpop+jwt',
            jwk: expect.objectContaining({
              n: expect.any(String)
            })
          },
          payload: {
            htm: 'POST',
            htu: 'http://superfake',
            iat: expect.any(Number),
            jti: expect.any(String),
          }
        });
        expect(decodeToken(secondCall)).toMatchObject({
          header: {
            alg: 'RS256',
            typ: 'dpop+jwt',
            jwk: expect.objectContaining({
              n: expect.any(String)
            })
          },
          payload: {
            htm: 'POST',
            htu: 'http://superfake',
            iat: expect.any(Number),
            jti: expect.any(String),
            nonce: 'nonceuponatime'
          }
        });
      });
    });

    describe('postRefreshToken', () => {
      it('throws if no key pair is provided', async () => {
        const { client, options, refreshToken } = ctx;
        jest.spyOn(mocked.http, 'httpRequest').mockImplementation();
        options.dpopKeyPair = undefined;
        await expect(async () => await postRefreshToken(client, options, refreshToken)).rejects.toThrow();
      });
  
      it('handles dpop nonce error (happpy path)', async () => {
        const { client, options, refreshToken } = ctx;
        const httpSpy = jest.spyOn(mocked.http, 'httpRequest')
          .mockRejectedValueOnce(new OAuthError('use_dpop_nonce',
            'Authorization server requires nonce in DPoP proof.',
            { status: 400, responseText: 'Bad Request', headers: { 'dpop-nonce': 'nonceuponatime' }})
          ).mockImplementation();
        await postRefreshToken(client, options, refreshToken);
        expect(httpSpy).toHaveBeenCalledTimes(2);
        const firstCall = (httpSpy.mock.calls[0][1] as any).headers.DPoP;
        const secondCall = (httpSpy.mock.calls[1][1] as any).headers.DPoP;
        expect(firstCall).not.toEqual(secondCall);
        expect(decodeToken(firstCall)).toMatchObject({
          header: {
            alg: 'RS256',
            typ: 'dpop+jwt',
            jwk: expect.objectContaining({
              n: expect.any(String)
            })
          },
          payload: {
            htm: 'POST',
            htu: 'https://auth-js-test.okta.com/oauth2/v1/token',
            iat: expect.any(Number),
            jti: expect.any(String),
          }
        });
        expect(decodeToken(secondCall)).toMatchObject({
          header: {
            alg: 'RS256',
            typ: 'dpop+jwt',
            jwk: expect.objectContaining({
              n: expect.any(String)
            })
          },
          payload: {
            htm: 'POST',
            htu: 'https://auth-js-test.okta.com/oauth2/v1/token',
            iat: expect.any(Number),
            jti: expect.any(String),
            nonce: 'nonceuponatime'
          }
        });
      });
    });
  });
});
