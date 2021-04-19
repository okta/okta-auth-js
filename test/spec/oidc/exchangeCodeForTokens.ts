const postToTokenEndpoint = jest.fn();
jest.mock('../../../lib/oidc/endpoints/token', () => { return { postToTokenEndpoint }; });
const handleOAuthResponse = jest.fn();
jest.mock('../../../lib/oidc/handleOAuthResponse', () => { return { handleOAuthResponse }; });

import { exchangeCodeForTokens, getOAuthUrls } from '../../../lib/oidc';
import { OktaAuth } from '../../../lib/types';

function mockOktaAuth(): OktaAuth {
  return {
    options: {
      issuer: 'http://fake'
    },
    transactionManager: {
      clear: jest.fn()
    }
  } as unknown as OktaAuth;
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
});

