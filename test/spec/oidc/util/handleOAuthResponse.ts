const exchangeCodeForTokens = jest.fn();
jest.mock('../../../../lib/oidc/exchangeCodeForTokens', () => { return { exchangeCodeForTokens }; });

const verifyToken = jest.fn();
jest.mock('../../../../lib/oidc/verifyToken', () => { return { verifyToken }; });

import { handleOAuthResponse } from '../../../../lib/oidc';

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
        })
      }
    };
  }

  function addBaselineTests() {
    describe('baseline', () => {
    
      it('returns access_token from the response', async () => {
        const res = await handleOAuthResponse(sdk, { responseType: 'token' }, { access_token: 'foo' }, undefined);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.accessToken).toBeTruthy();
        expect(res.tokens.accessToken.accessToken).toBe('foo');
      });
      it('returns id_token from the response', async () => {
        const res = await handleOAuthResponse(sdk, { responseType: 'id_token' }, { id_token: 'foo' }, undefined);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.idToken).toBeTruthy();
        expect(res.tokens.idToken.idToken).toBe('foo');
      });
      it('returns refresh_token from the response', async () => {
        const res = await handleOAuthResponse(sdk, { responseType: 'refresh_token' }, { refresh_token: 'foo' }, undefined);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.refreshToken).toBeTruthy();
        expect(res.tokens.refreshToken.refreshToken).toBe('foo');
      });
      it('returns all tokens from the response', async () => {
        const tokenParams = { responseType: ['token', 'id_token', 'refresh_token'] };
        const oauthRes = { id_token: 'foo', access_token: 'blar', refresh_token: 'bloo' };
        const res = await handleOAuthResponse(sdk, tokenParams, oauthRes, undefined);
        expect(res.tokens).toBeTruthy();
        expect(res.tokens.accessToken).toBeTruthy();
        expect(res.tokens.accessToken.accessToken).toBe('blar');
        expect(res.tokens.idToken).toBeTruthy();
        expect(res.tokens.idToken.idToken).toBe('foo');
        expect(res.tokens.refreshToken).toBeTruthy();
        expect(res.tokens.refreshToken.refreshToken).toBe('bloo');
      });

      describe('errors', () => {
        beforeEach(() => {
          sdk = mockOktaAuth();
        });
      
        it('throws if response contains "error"', async () => {
          try {
            await handleOAuthResponse(sdk, undefined, { error: 'blah' }, undefined);
          } catch (err) {
            expect(err.name).toBe('OAuthError');
            expect(err.errorCode).toBe('blah');
          }
        });
    
        it('throws if response contains "error_description"', async () => {
          try {
            await handleOAuthResponse(sdk, undefined, { error_description: 'blah' }, undefined);
          } catch (err) {
            expect(err.name).toBe('OAuthError');
            expect(err.errorSummary).toBe('blah');
          }
        });
    
        it('throws if state does not match', async () => {
          try {
            await handleOAuthResponse(sdk, { state: 'bar' }, { state: 'foo' }, undefined);
          } catch (err) {
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorSummary).toBe(`OAuth flow response state doesn't match request state`);
          }
        });
        it('throws if ID token was expected but not returend', async () => {
          try {
            await handleOAuthResponse(sdk, { responseType: ['token', 'id_token'] }, { access_token: 'foo' }, undefined);
          } catch (err) {
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorCode).toBe('INTERNAL');
            expect(err.errorSummary).toBe(`Unable to parse OAuth flow response: response type "id_token" was requested but "id_token" was not returned.`);
          }
        });
        it('throws if access token was expected but not returend', async () => {
          try {
            await handleOAuthResponse(sdk, { responseType: ['token', 'id_token'] }, { id_token: 'foo' }, undefined);
          } catch (err) {
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorCode).toBe('INTERNAL');
            expect(err.errorSummary).toBe(`Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.`);
          }
        });
        it('throws if id_token and access token were expected but not returned', async () => {
          try {
            await handleOAuthResponse(sdk, { responseType: ['token', 'id_token'] }, { }, undefined);
          } catch (err) {
            expect(err.name).toBe('AuthSdkError');
            expect(err.errorCode).toBe('INTERNAL');
            expect(err.errorSummary).toBe(`Unable to parse OAuth flow response: response type "token" was requested but "access_token" was not returned.`);
          }
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
      exchangeCodeForTokens.mockResolvedValue(mockTokens);
    });

    addBaselineTests();

    describe('Authorization code flow', () => {
      it('calls `exchangeCodeForTokens` if response contains "code"', async () => {
        const res = await handleOAuthResponse(sdk, undefined, { code: 'blah' }, undefined);
        expect(exchangeCodeForTokens).toHaveBeenCalledWith(sdk, {
          authorizationCode: 'blah',
          interactionCode: undefined
        }, undefined);
        expect(res).toBe(mockTokens);
      });
    });

    describe('Interaction code flow', () => {
      it('calls `exchangeCodeForTokens` if response contains "interaction_code"', async () => {
        const res = await handleOAuthResponse(sdk, undefined, { 'interaction_code': 'blah' }, undefined);
        expect(exchangeCodeForTokens).toHaveBeenCalledWith(sdk, {
          authorizationCode: undefined,
          interactionCode: 'blah'
        }, undefined);
        expect(res).toBe(mockTokens);
      });
    });
  });
});