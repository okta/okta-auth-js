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


const postToTokenEndpoint = jest.fn();
jest.mock('../../../lib/oidc/endpoints/token', () => { return { postToTokenEndpoint }; });
const handleOAuthResponse = jest.fn();
jest.mock('../../../lib/oidc/handleOAuthResponse', () => { return { handleOAuthResponse }; });

import { AuthSdkError } from '../../../lib/errors';
import { exchangeCodeForTokens, getOAuthUrls } from '../../../lib/oidc';
import { OktaAuthOAuthInterface } from '../../../lib/oidc/types';

function mockOktaAuth(): OktaAuthOAuthInterface {
  return {
    options: {
      issuer: 'http://fake'
    },
    transactionManager: {
      clear: jest.fn()
    }
  } as unknown as OktaAuthOAuthInterface;
}

describe('exchangeCodeForTokens', () => {

  it('passes parameters to `postToTokenEndpoint`', async () => {
    const sdk = mockOktaAuth();
    const oauthResponse = {}; // response from token endpoint
    const tokenResponse = {}; // response to caller
    (postToTokenEndpoint as jest.Mock).mockResolvedValue(oauthResponse);
    (handleOAuthResponse as jest.Mock).mockResolvedValue(tokenResponse);
    const authorizationCode = 'a';
    const clientId = 'x';
    const codeVerifier = 'y';
    const interactionCode = 'b';
    const redirectUri = 'http://localhost';
    const tokenParams = { authorizationCode, clientId, codeVerifier, interactionCode, redirectUri };
    const urls = getOAuthUrls(sdk);
    await exchangeCodeForTokens(sdk, tokenParams);
    expect(postToTokenEndpoint).toHaveBeenCalledWith(sdk, tokenParams, urls);
    expect(handleOAuthResponse).toHaveBeenCalledWith(sdk, {
      clientId,
      ignoreSignature: undefined,
      redirectUri,
      responseType: ['token', 'id_token'],
      scopes: ['openid', 'email']
    }, oauthResponse, urls);
  });

  it('does not set responseType `id_token` if `openid` scope is not set', async () => {
    const sdk = mockOktaAuth();
    const oauthResponse = {}; // response from token endpoint
    const tokenResponse = {}; // response to caller
    (postToTokenEndpoint as jest.Mock).mockResolvedValue(oauthResponse);
    (handleOAuthResponse as jest.Mock).mockResolvedValue(tokenResponse);
    const authorizationCode = 'a';
    const clientId = 'x';
    const codeVerifier = 'y';
    const interactionCode = 'b';
    const redirectUri = 'http://localhost';
    const scopes = ['email'];
    const tokenParams = { authorizationCode, clientId, codeVerifier, interactionCode, redirectUri, scopes };
    const urls = getOAuthUrls(sdk);
    await exchangeCodeForTokens(sdk, tokenParams);
    expect(postToTokenEndpoint).toHaveBeenCalledWith(sdk, { authorizationCode, clientId, codeVerifier, interactionCode, redirectUri }, urls);
    expect(handleOAuthResponse).toHaveBeenCalledWith(sdk, {
      clientId,
      ignoreSignature: undefined,
      redirectUri,
      responseType: ['token'],
      scopes: ['email']
    }, oauthResponse, urls);
  });


  describe('validateOptions', function() {
    var authClient;
    var oauthOptions;

    beforeEach(() => {
      authClient = mockOktaAuth();
      const oauthResponse = {}; // response from token endpoint
      const tokenResponse = {}; // response to caller
      (postToTokenEndpoint as jest.Mock).mockResolvedValue(oauthResponse);
      (handleOAuthResponse as jest.Mock).mockResolvedValue(tokenResponse);
      var CLIENT_ID = 'fake';
      var REDIRECT_URI = 'http://fake.local';
      var codeVerifier = 'superfake';
      var authorizationCode = 'notreal';
      oauthOptions = {
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        authorizationCode: authorizationCode,
        codeVerifier: codeVerifier,
      };
    });

    it('Does not throw if options are valid', async function() {
      await exchangeCodeForTokens(authClient, oauthOptions);
      expect(postToTokenEndpoint).toHaveBeenCalled();
    });

    it('Throws if no clientId', async function() {
      oauthOptions.clientId = undefined;
      await expect(async () => {
        await exchangeCodeForTokens(authClient, oauthOptions);
      }).rejects.toThrow(new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token'));
    });

    it('Throws if no redirectUri', async function() {
      oauthOptions.redirectUri = undefined;
      await expect(async () => {
        await exchangeCodeForTokens(authClient, oauthOptions);
      }).rejects.toThrow(new AuthSdkError('The redirectUri passed to /authorize must also be passed to /token'));
    });

    it('Throws if no authorizationCode', async function() {
      oauthOptions.authorizationCode = undefined;
      await expect(async () => {
        await exchangeCodeForTokens(authClient, oauthOptions);
      }).rejects.toThrow(new AuthSdkError('An authorization code (returned from /authorize) must be passed to /token'));
    });

    it('Throws if no codeVerifier', async function() {
      oauthOptions.codeVerifier = undefined;
      await expect(async () => {
        await exchangeCodeForTokens(authClient, oauthOptions);
      }).rejects.toThrow(new AuthSdkError('The "codeVerifier" (generated and saved by your app) must be passed to /token'));
    });

  });
});

