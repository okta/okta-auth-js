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

import { renewTokens } from '../../../lib/oidc';
import { AuthSdkError } from '../../../lib/errors';

jest.mock('../../../lib/oidc/getWithoutPrompt', () => {
  return {
    getWithoutPrompt: () => {}
  };
});

jest.mock('../../../lib/oidc/renewTokensWithRefresh', () => {
  return {
    renewTokensWithRefresh: () => {}
  };
});

const mocked = {
  getWithoutPrompt: require('../../../lib/oidc/getWithoutPrompt'),
  renewTokensWithRefresh: require('../../../lib/oidc/renewTokensWithRefresh')
};

describe('token.renewTokens', function() {
  let testContext;
  beforeEach(() => {
    const getWihoutPromptResponse = {};
    const renewWithRefreshResponse = {};
    testContext = {
      getWihoutPromptResponse,
      renewWithRefreshResponse
    };
    jest.spyOn(mocked.getWithoutPrompt, 'getWithoutPrompt').mockImplementation(() => {
      return Promise.resolve(testContext.getWihoutPromptResponse);
    });
    jest.spyOn(mocked.renewTokensWithRefresh, 'renewTokensWithRefresh').mockImplementation(() => {
      return Promise.resolve(testContext.renewWithRefreshResponse);
    });
  });

  it('will throw if there are no existing tokens', async () => {
    const tokens = {};
    const sdk = {
      tokenManager: {
        getTokensSync: () => tokens
      }
    };
    await expect(renewTokens(sdk)).rejects.toEqual(new AuthSdkError('renewTokens() was called but there is no existing token'));
  });

  describe('using token endpoint', () => {
    it('will renew using refresh token if it exists, passing along options', async () => {
      const { renewWithRefreshResponse,  } = testContext;
      const refreshToken = 'fake';
      const tokens = {
        refreshToken
      };
      const sdk = {
        tokenManager: {
          getTokensSync: () => tokens
        }
      };
      jest.spyOn(mocked.renewTokensWithRefresh, 'renewTokensWithRefresh');
      const options = {};
      const res = await renewTokens(sdk, options);
      expect(res).toBe(renewWithRefreshResponse);
      expect(mocked.renewTokensWithRefresh.renewTokensWithRefresh).toHaveBeenCalledWith(sdk, options, refreshToken);

      // with passing token values directly
      const accessToken = {
        accessToken: 'access',
        scopes: ['access'],
        authorizeUrl: 'access',
        userinfoUrl: 'access',
      } as any;
      const refresh = {
        refreshToken
      } as any;
      const opts = { tokens: { refreshToken: refresh, accessToken }};
      const directRes = await renewTokens(sdk, opts);
      expect(directRes).toBe(renewWithRefreshResponse);
      expect(mocked.renewTokensWithRefresh.renewTokensWithRefresh).toHaveBeenCalledTimes(2);
      expect(mocked.renewTokensWithRefresh.renewTokensWithRefresh).toHaveBeenNthCalledWith(2, sdk, opts, refresh);
    });
  });

  describe('using authorize endpoint', () => {
    beforeEach(() => {
      const accessToken = {
        accessToken: true,
        scopes: ['access'],
        authorizeUrl: 'access',
        userinfoUrl: 'access'
      };
      const idToken = {
        idtoken: true,
        scopes: ['id'],
        authorizeUrl: 'id',
        issuer: 'id'
      };
      const sdk = {
        options: {
          userinfoUrl: 'sdk',
          issuer: 'sdk'
        },
        tokenManager: {
          getTokensSync: () => {
            const { accessToken, idToken } = testContext;
            return {
              accessToken,
              idToken
            };
          }
        }
      };
      Object.assign(testContext, {
        accessToken,
        idToken,
        sdk
      });
    });

    it('returns tokens', async () => {
      const { sdk, getWihoutPromptResponse } = testContext;
      const tokens = { fake: true };
      getWihoutPromptResponse.tokens = tokens;
      const res = await renewTokens(sdk, {});
      expect(res).toBe(tokens);
    });

    it('returns tokens without accessing TokenManager', async () => {
      const { sdk, getWihoutPromptResponse, accessToken } = testContext;
      const getTokensSpy = jest.spyOn(sdk.tokenManager, 'getTokensSync');
      const tokens = { fake: true };
      getWihoutPromptResponse.tokens = tokens;
      const res = await renewTokens(sdk, { tokens: { accessToken } });
      expect(res).toBe(tokens);
      expect(getTokensSpy).not.toHaveBeenCalled();
    });

    describe('responseType', () => {
      it('if PKCE is not enabled, responseType is set to ["token", "id_token"]', async () => {
        const { sdk } = testContext;
        sdk.options.pkce = false;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.responseType).toEqual(['token', 'id_token']);
      });
  
      it('if PKCE is enabled, responseType is set to "code"', async () => {
        const { sdk } = testContext;
        sdk.options.pkce = true;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.responseType).toBe('code');
      });
    });

    describe('scopes', () => {
      it('will prefer scopes saved on accessToken', async () => {
        const { sdk } = testContext;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.scopes).toEqual(['access']);
      });
  
      it('will use scopes from idToken, if no accessToken', async () => {
        const { sdk } = testContext;
        testContext.accessToken = null;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.scopes).toEqual(['id']);
      });

      it('will throw if no scopes on the tokens', async () => {
        const { sdk, accessToken, idToken } = testContext;
        accessToken.scopes = null;
        idToken.scopes = null;
        await expect(renewTokens(sdk)).rejects.toEqual(new AuthSdkError('renewTokens: invalid tokens: could not read scopes'));
      });

      it('scopes can be overriden via options', async () => {
        const { sdk } = testContext;
        await renewTokens(sdk, { scopes: ['custom'] });
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.scopes).toEqual(['custom']);
      });
    });

    describe('authorizeUrl', () => {
      it('will prefer authorizeUrl saved on accessToken', async () => {
        const { sdk } = testContext;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.authorizeUrl).toBe('access');
      });

      it('will use scopes from idToken, if no accessToken', async () => {
        const { sdk } = testContext;
        testContext.accessToken = null;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.authorizeUrl).toBe('id');
      });

      it('will throw if no authorizeUrl on the tokens', async () => {
        const { sdk, accessToken, idToken } = testContext;
        accessToken.authorizeUrl = null;
        idToken.authorizeUrl = null;
        await expect(renewTokens(sdk)).rejects.toEqual(new AuthSdkError('renewTokens: invalid tokens: could not read authorizeUrl'));
      });

      it('authorizeUrl can be overriden via options', async () => {
        const { sdk } = testContext;
        await renewTokens(sdk, { authorizeUrl: 'custom' });
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.authorizeUrl).toBe('custom');
      });
    });

    describe('userinfoUrl', () => {
      it('will prefer userinfoUrl saved on accessToken', async () => {
        const { sdk } = testContext;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.userinfoUrl).toBe('access');
      });

      it('will use userinfoUrl from sdk options, if no accessToken', async () => {
        const { sdk } = testContext;
        testContext.accessToken = null;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.userinfoUrl).toBe('sdk');
      });

      it('userinfoUrl can be overridden via options', async () => {
        const { sdk } = testContext;
        await renewTokens(sdk, { userinfoUrl: 'custom' });
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.userinfoUrl).toBe('custom');
      });
    });

    describe('issuer', () => {
      it('will prefer issuer saved on idToken', async () => {
        const { sdk } = testContext;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.issuer).toBe('id');
      });

      it('will use issuer from sdk options, if no idToken', async () => {
        const { sdk } = testContext;
        testContext.idToken = null;
        await renewTokens(sdk, {});
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.issuer).toBe('sdk');
      });

      it('issuer can be overridden via options', async () => {
        const { sdk } = testContext;
        await renewTokens(sdk, { issuer: 'custom' });
        const options = mocked.getWithoutPrompt.getWithoutPrompt.mock.calls[0][1];
        expect(options.issuer).toBe('custom');
      });
    });

  });
 
});
