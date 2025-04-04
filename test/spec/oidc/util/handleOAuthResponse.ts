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

const verifyToken = jest.fn();
jest.mock('../../../../lib/oidc/verifyToken', () => { return { verifyToken }; });

import { handleOAuthResponse, CustomUrls, TokenParams } from '../../../../lib/oidc';

describe('handleOAuthResponse', () => {
  let sdk;
  beforeEach(() => {
    sdk = null;
    verifyToken.mockResolvedValue(null);
  });

  function mockOktaAuth(options = {}) {
    options = Object.assign({
      issuer: 'http://fake'
    }, options);
    return {
      options,
      token: {
        decode: jest.fn().mockReturnValue({
          payload: {}
        }),
        exchangeCodeForTokens: jest.fn()
      }
    };
  }

  function addBaselineTests() {
    describe('baseline', () => {
    
      it('returns access_token from the response', async () => {
        const res = await handleOAuthResponse(sdk, { responseType: 'token' }, { access_token: 'foo' }, undefined as unknown as CustomUrls);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.accessToken).toBeTruthy();
        expect(res.tokens.accessToken!.accessToken).toBe('foo');
      });
      it('returns id_token from the response', async () => {
        const res = await handleOAuthResponse(sdk, { responseType: 'id_token' }, { id_token: 'foo' }, undefined as unknown as CustomUrls);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.idToken).toBeTruthy();
        expect(res.tokens.idToken!.idToken).toBe('foo');
      });
      it('returns refresh_token from the response', async () => {
        const res = await handleOAuthResponse(sdk, { responseType: 'refresh_token' }, { refresh_token: 'foo' }, undefined as unknown as CustomUrls);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.refreshToken).toBeTruthy();
        expect(res.tokens.refreshToken!.refreshToken).toBe('foo');
      });
      it('returns all tokens from the response', async () => {
        const tokenParams: TokenParams = {
          responseType: ['token', 'id_token', 'refresh_token'],
          dpop: true,
          extraParams: { foo: 'bar' }
        };
        const oauthRes = { id_token: 'foo', access_token: 'blar', refresh_token: 'bloo', token_type: 'DPoP' };
        const res = await handleOAuthResponse(sdk, tokenParams, oauthRes, undefined as unknown as CustomUrls);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.accessToken).toBeTruthy();
        expect(res.tokens.accessToken!.accessToken).toBe('blar');
        expect(res.tokens.accessToken!.extraParams).toEqual({ foo: 'bar' });
        expect(res.tokens.idToken).toBeTruthy();
        expect(res.tokens.idToken!.idToken).toBe('foo');
        expect(res.tokens.idToken!.extraParams).toEqual({ foo: 'bar' });
        expect(res.tokens.refreshToken).toBeTruthy();
        expect(res.tokens.refreshToken!.refreshToken).toBe('bloo');
        expect(res.tokens.refreshToken!.extraParams).toEqual({ foo: 'bar' });
      });
      it('prefers "scope" value from endpoint response over method parameter', async () => {
        const tokenParams: TokenParams = { responseType: ['token', 'id_token', 'refresh_token'], scopes: ['profile'] };
        const oauthRes = { id_token: 'foo', access_token: 'blar', refresh_token: 'bloo', scope: 'openid offline_access' };
        const res = await handleOAuthResponse(sdk, tokenParams, oauthRes, undefined as unknown as CustomUrls);
        expect(res.tokens.accessToken!.scopes).toEqual(['openid', 'offline_access']);
        expect(res.tokens.idToken!.scopes).toEqual(['openid', 'offline_access']);
        expect(res.tokens.refreshToken!.scopes).toEqual(['openid', 'offline_access']);
      });
      describe('errors', () => {
        it('does not throw if response contains only "error" without "error_description"', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, {}, { error: 'blah' }, undefined  as unknown as CustomUrls);
          } catch (err) {
            errorThrown = true;
          }
          expect(errorThrown).toBe(false);
        });

        it('does not throw if response contains only "error_description" without "error"', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, {}, { error_description: 'blah' }, undefined  as unknown as CustomUrls);
          } catch (err) {
            errorThrown = true;
          }
          expect(errorThrown).toBe(false);
        });

        it('does not throw if responseType is "none" and response contains no tokens', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, {responseType: 'none'}, {}, undefined  as unknown as CustomUrls);
          } catch (err) {
            errorThrown = true;
          }
          expect(errorThrown).toBe(false);
        });

        it('throws if response contains both "error" and "error_description"', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, {}, { error: 'error code', error_description: 'error description' }, undefined  as unknown as CustomUrls);
          } catch (err: any) {
            errorThrown = true;
            expect(err.name).toBe('OAuthError');
            expect(err.errorCode).toBe('error code');
            expect(err.errorSummary).toBe('error description');
          }
          expect(errorThrown).toBe(true);
        });
    
        it('throws if state does not match', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, { state: 'bar' }, { state: 'foo' }, undefined as unknown as CustomUrls);
          } catch (err: any) {
            errorThrown = true;
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorSummary).toBe(`OAuth flow response state doesn't match request state`);
          }
          expect(errorThrown).toBe(true);
        });
        it('throws if ID token was expected but not returend', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, { responseType: ['token', 'id_token'] }, { access_token: 'foo' }, undefined as unknown as CustomUrls);
          } catch (err: any) {
            errorThrown = true;
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorCode).toBe('INTERNAL');
            expect(err.errorSummary).toBe(`Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.`);
          }
          expect(errorThrown).toBe(true);
        });
        it('throws if access token was expected but not returend', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, { responseType: ['token', 'id_token'] }, { id_token: 'foo' }, undefined as unknown as CustomUrls);
          } catch (err: any) {
            errorThrown = true;
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorCode).toBe('INTERNAL');
            expect(err.errorSummary).toBe(`Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.`);
          }
          expect(errorThrown).toBe(true);
        });
        it('throws if id_token and access token were expected but not returned', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, { responseType: ['token', 'id_token'] }, { }, undefined as unknown as CustomUrls);
          } catch (err: any) {
            errorThrown = true;
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorCode).toBe('INTERNAL');
            expect(err.errorSummary).toBe(`Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.`);
          }
          expect(errorThrown).toBe(true);
        });
        it('throws if dpop=true and token_type is not DPoP', async () => {
          let errorThrown = false;
          try {
            await handleOAuthResponse(sdk, { responseType: ['token', 'id_token'], dpop: true }, { }, undefined);
          } catch (err: any) {
            errorThrown = true;
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorCode).toBe('INTERNAL');
            expect(err.errorSummary).toBe(`Unable to parse OAuth flow response: DPoP was configured but "token_type" was not DPoP`);
          }
          expect(errorThrown).toBe(true);
        });
      });
    });
  }

  describe('Implicit flow', () => {
    beforeEach(() => {
      sdk = mockOktaAuth({
        pkce: false
      });
    });
    addBaselineTests();
  });

  describe('PKCE', () => {
    let mockTokens;
    beforeEach(() => {
      sdk = mockOktaAuth({
        pkce: true
      });
      mockTokens = {};
      sdk.token.exchangeCodeForTokens.mockResolvedValue(mockTokens);
    });

    addBaselineTests();

    describe('Authorization code flow', () => {
      it('calls `exchangeCodeForTokens` if response contains "code"', async () => {
        const res = await handleOAuthResponse(sdk, {}, { code: 'blah' }, undefined as unknown as CustomUrls);
        expect(sdk.token.exchangeCodeForTokens).toHaveBeenCalledWith({
          authorizationCode: 'blah',
          interactionCode: undefined
        }, undefined);
        expect(res).toBe(mockTokens);
      });

      it('allows Bearer tokens to be returned when DPoP token was requested', async () => {
        sdk = mockOktaAuth({
          dpopOptions: { allowBearerTokens: true }
        });
        const tokenParams: TokenParams = {
          responseType: ['token', 'id_token', 'refresh_token'],
          dpop: true,
          extraParams: { foo: 'bar' }
        };
        const oauthRes = { id_token: 'foo', access_token: 'blar', refresh_token: 'bloo', token_type: 'Bearer' };
        const res = await handleOAuthResponse(sdk, tokenParams, oauthRes, undefined as unknown as CustomUrls);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.accessToken).toBeTruthy();
        expect(res.tokens.accessToken!.accessToken).toBe('blar');
        expect(res.tokens.accessToken!.extraParams).toEqual({ foo: 'bar' });
        expect(res.tokens.idToken).toBeTruthy();
        expect(res.tokens.idToken!.idToken).toBe('foo');
        expect(res.tokens.idToken!.extraParams).toEqual({ foo: 'bar' });
        expect(res.tokens.refreshToken).toBeTruthy();
        expect(res.tokens.refreshToken!.refreshToken).toBe('bloo');
        expect(res.tokens.refreshToken!.extraParams).toEqual({ foo: 'bar' });
      });
    });

    describe('Interaction code flow', () => {
      it('calls `exchangeCodeForTokens` if response contains "interaction_code"', async () => {
        const res = await handleOAuthResponse(sdk, {}, { 'interaction_code': 'blah' }, undefined as unknown as CustomUrls);
        expect(sdk.token.exchangeCodeForTokens).toHaveBeenCalledWith({
          authorizationCode: undefined,
          interactionCode: 'blah'
        }, undefined);
        expect(res).toBe(mockTokens);
      });
    });
  });
});