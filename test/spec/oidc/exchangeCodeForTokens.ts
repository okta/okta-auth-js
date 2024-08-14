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
const findKeyPair = jest.fn();
const createDPoPKeyPair = jest.fn();
jest.mock('../../../lib/oidc/dpop', () => { return { findKeyPair, createDPoPKeyPair }; });


import { exchangeCodeForTokens, getOAuthUrls } from '../../../lib/oidc';
// import { generateKeyPair } from '../../../lib/oidc/dpop';
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

const testParams = {
  authorizationCode: 'a',
  clientId: 'x',
  codeVerifier: 'y',
  interactionCode: 'b',
  redirectUri: 'http://localhost',
};

describe('exchangeCodeForTokens', () => {

  it('passes parameters to `postToTokenEndpoint`', async () => {
    const sdk = mockOktaAuth();
    const oauthResponse = {}; // response from token endpoint
    const tokenResponse = {}; // response to caller
    (postToTokenEndpoint as jest.Mock).mockResolvedValue(oauthResponse);
    (handleOAuthResponse as jest.Mock).mockResolvedValue(tokenResponse);
    const acrValues = 'foo';
    const tokenParams = {
      ...testParams,
      acrValues,
      extraParams: {
        foo: 'bar'
      }
    };
    const urls = getOAuthUrls(sdk);
    await exchangeCodeForTokens(sdk, tokenParams);
    expect(postToTokenEndpoint).toHaveBeenCalledWith(sdk, testParams, urls);
    expect(handleOAuthResponse).toHaveBeenCalledWith(sdk, {
      clientId: testParams.clientId,
      ignoreSignature: undefined,
      redirectUri: testParams.redirectUri,
      responseType: ['token', 'id_token'],
      scopes: ['openid', 'email'],
      acrValues,
      extraParams: tokenParams.extraParams
    }, oauthResponse, urls);
  });

  it('does not set responseType `id_token` if `openid` scope is not set', async () => {
    const sdk = mockOktaAuth();
    const oauthResponse = {}; // response from token endpoint
    const tokenResponse = {}; // response to caller
    (postToTokenEndpoint as jest.Mock).mockResolvedValue(oauthResponse);
    (handleOAuthResponse as jest.Mock).mockResolvedValue(tokenResponse);
    const scopes = ['email'];
    const tokenParams = { ...testParams, scopes };
    const urls = getOAuthUrls(sdk);
    await exchangeCodeForTokens(sdk, tokenParams);
    expect(postToTokenEndpoint).toHaveBeenCalledWith(sdk, testParams, urls);
    expect(handleOAuthResponse).toHaveBeenCalledWith(sdk, {
      clientId: testParams.clientId,
      ignoreSignature: undefined,
      redirectUri: testParams.redirectUri,
      responseType: ['token'],
      scopes: ['email']
    }, oauthResponse, urls);
  });

  it('should pass dpop key pair during token refresh', async () => {
    const sdk = mockOktaAuth();
    const oauthResponse = {}; // response from token endpoint
    const tokenResponse = {}; // response to caller
    (postToTokenEndpoint as jest.Mock).mockResolvedValue(oauthResponse);
    (handleOAuthResponse as jest.Mock).mockResolvedValue(tokenResponse);
    (findKeyPair as jest.Mock).mockResolvedValue({});
    const scopes = ['email'];
    const tokenParams = { ...testParams, scopes, dpop: true, dpopPairId: 'foo' };
    const urls = getOAuthUrls(sdk);
    await exchangeCodeForTokens(sdk, tokenParams);
    expect(findKeyPair).toBeCalledWith('foo');
    expect(postToTokenEndpoint).toHaveBeenCalledWith(sdk, {
      ...testParams, dpop: true, dpopKeyPair: {}
    }, urls);
    expect(handleOAuthResponse).toHaveBeenCalledWith(sdk, {
      clientId: testParams.clientId,
      ignoreSignature: undefined,
      redirectUri: testParams.redirectUri,
      responseType: ['token'],
      scopes: ['email'],
      dpop: true,
      dpopPairId: 'foo',
    }, oauthResponse, urls);
  });

  it('should create and pass dpop key pair during initial token request', async () => {
    const sdk = mockOktaAuth();
    const oauthResponse = {}; // response from token endpoint
    const tokenResponse = {}; // response to caller
    (postToTokenEndpoint as jest.Mock).mockResolvedValue(oauthResponse);
    (handleOAuthResponse as jest.Mock).mockResolvedValue(tokenResponse);
    (createDPoPKeyPair as jest.Mock).mockResolvedValue({ keyPair: {}, keyPairId: 'bar'});
    const scopes = ['email'];
    const tokenParams = { ...testParams, scopes, dpop: true };
    const urls = getOAuthUrls(sdk);
    await exchangeCodeForTokens(sdk, tokenParams);
    expect(createDPoPKeyPair).toHaveBeenCalledTimes(1);
    expect(postToTokenEndpoint).toHaveBeenCalledWith(sdk, {
      ...testParams, dpop: true, dpopKeyPair: {}
    }, urls);
    expect(handleOAuthResponse).toHaveBeenCalledWith(sdk, {
      clientId: testParams.clientId,
      ignoreSignature: undefined,
      redirectUri: testParams.redirectUri,
      responseType: ['token'],
      scopes: ['email'],
      dpop: true,
      dpopPairId: 'bar',
    }, oauthResponse, urls);
  });
});

