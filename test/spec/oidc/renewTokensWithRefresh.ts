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


import { TokenResponse } from './../../../build/lib/types/api.d';
import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import * as tokenEndpoint from '../../../lib/oidc/endpoints/token';
import * as renewTokensWithRefreshTokenModule from '../../../lib/oidc/renewTokensWithRefresh';
import * as getWithoutPromptModule from '../../../lib/oidc/getWithoutPrompt';
import oauthUtil from '@okta/test.support/oauthUtil';
import util from '@okta/test.support/util';

describe('renewTokensWithRefresh', function () {
  let testContext;

  beforeEach(function () {
    const getWithoutPromptResponse: TokenResponse = {
      tokens: {},
      state: '',
      code: ''
    };
    jest.spyOn(getWithoutPromptModule, 'getWithoutPrompt').mockImplementation(function () {
      return Promise.resolve(getWithoutPromptResponse);
    });

    const postRefreshTokenResponse = {
      'id_token': tokens.standardIdToken,
      'refresh_token': tokens.standardRefreshToken2,
      'expires_in': '0',
      'scope': 'openid email',
    };

    jest.spyOn(tokenEndpoint, 'postRefreshToken').mockImplementation(function () {
      return Promise.resolve(postRefreshTokenResponse);
    });
    const renewTokenSpy = jest.spyOn(renewTokensWithRefreshTokenModule, 'renewTokensWithRefresh');

    util.warpToUnixTime(tokens.time);
    const authInstance = new OktaAuth({
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
    });
    authInstance.tokenManager.clear();
    oauthUtil.loadWellKnownAndKeysCache(authInstance);

    testContext = {
      getWithoutPromptResponse,
      postRefreshTokenResponse,
      renewTokenSpy,
      authInstance
    };
  });

  it('is called when refresh token is available in browser storage', async function() {
    const { authInstance, renewTokenSpy } = testContext;
    await authInstance.token.renewTokens();
    expect(renewTokenSpy).not.toHaveBeenCalled();
    expect(getWithoutPromptModule.getWithoutPrompt).toHaveBeenCalled();

    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);
    await authInstance.token.renewTokens();

    const renewTokenArguments = renewTokenSpy.mock.calls[0];
    expect(renewTokenSpy).toHaveBeenCalled();
    expect(renewTokenArguments[2]).toMatchObject(tokens.standardRefreshTokenParsed);
  });

  it('returns tokens dict', async function() {
    const { authInstance } = testContext;
    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);

    const newTokens = await authInstance.token.renewTokens();
    expect(newTokens['idToken']).toEqual(tokens.standardIdTokenParsed);
    expect(newTokens['refreshToken']).toEqual(tokens.standardRefreshToken2Parsed);
  });

  it('throws when SDK has no clientId configured', async function() {
    const authInstance = new OktaAuth({
      issuer: 'https://auth-js-test.okta.com',
    });
    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);
    await expect(authInstance.token.renewTokens()).rejects.toThrow(
      'A clientId must be specified in the OktaAuth constructor to renew tokens');
  });

  it('saves refresh token if a different refresh token is returned, but does not trigger "add" event', async () => {
    const { authInstance } = testContext;
    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);
    let refreshToken = await authInstance.tokenManager.get('refreshToken');
    expect(refreshToken).toEqual(tokens.standardRefreshTokenParsed);
    jest.spyOn(authInstance.tokenManager, 'add');
    await authInstance.token.renewTokens();
    expect(authInstance.tokenManager.add).not.toHaveBeenCalled();
    refreshToken = await authInstance.tokenManager.get('refreshToken');
    expect(refreshToken).toEqual(tokens.standardRefreshToken2Parsed);
  });

  it('does not save refresh token if same refresh token is returned', async () => {
    const { authInstance, postRefreshTokenResponse } = testContext;
    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);
    let refreshToken = await authInstance.tokenManager.get('refreshToken');
    expect(refreshToken).toEqual(tokens.standardRefreshTokenParsed);
    postRefreshTokenResponse['refresh_token'] = tokens.standardRefreshToken;
    jest.spyOn(authInstance.tokenManager, 'add');
    await authInstance.token.renewTokens();
    expect(authInstance.tokenManager.add).not.toHaveBeenCalled();
    refreshToken = await authInstance.tokenManager.get('refreshToken');
    expect(refreshToken).toEqual(tokens.standardRefreshTokenParsed);
  });

  it('does not save refresh token if NO refresh token is returned', async () => {
    const { authInstance, postRefreshTokenResponse } = testContext;
    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);
    let refreshToken = await authInstance.tokenManager.get('refreshToken');
    expect(refreshToken).toEqual(tokens.standardRefreshTokenParsed);
    postRefreshTokenResponse['refresh_token'] = undefined;
    jest.spyOn(authInstance.tokenManager, 'add');
    await authInstance.token.renewTokens();
    expect(authInstance.tokenManager.add).not.toHaveBeenCalled();
    refreshToken = await authInstance.tokenManager.get('refreshToken');
    expect(refreshToken).toEqual(tokens.standardRefreshTokenParsed);
  });

  it('supports rotating refresh tokens with custom key names (and does not fire "add" event)', async () => {
    const { authInstance } = testContext;
    authInstance.tokenManager.add('refreshToken2', tokens.standardRefreshTokenParsed);
    let refreshToken = await authInstance.tokenManager.get('refreshToken2');
    expect(refreshToken).toEqual(tokens.standardRefreshTokenParsed);
    jest.spyOn(authInstance.tokenManager, 'add');
    await authInstance.token.renewTokens();
    expect(authInstance.tokenManager.add).not.toHaveBeenCalled();
    refreshToken = await authInstance.tokenManager.get('refreshToken2');
    expect(refreshToken).toEqual(tokens.standardRefreshToken2Parsed);
  });
});
