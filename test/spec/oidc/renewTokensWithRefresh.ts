import { TokenResponse } from './../../../build/lib/types/api.d';
import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import util from '@okta/test.support/util';
import * as tokenEndpoint from '../../../lib/oidc/endpoints/token';
import * as renewTokensWithRefreshTokenModule from '../../../lib/oidc/renewTokensWithRefresh';
import * as getWithoutPromptModule from '../../../lib/oidc/getWithoutPrompt';
import oauthUtil from '@okta/test.support/oauthUtil';

describe('renewTokensWithRefresh', function () {
  let renewTokenSpy;
  let authInstance;

  beforeEach(function () {
    jest.spyOn(getWithoutPromptModule, 'getWithoutPrompt').mockImplementation(function () {
      const tokenResponse: TokenResponse = {
        tokens: {},
        state: '',
        code: ''
      };
      return Promise.resolve(tokenResponse);
    });
    jest.spyOn(tokenEndpoint, 'postRefreshToken').mockImplementation(function () {
      return Promise.resolve({
        'id_token': tokens.standardIdToken,
        'refresh_token': tokens.standardRefreshToken2,
        'expires_in': '0',
      });
    });
    renewTokenSpy = jest.spyOn(renewTokensWithRefreshTokenModule, 'renewTokensWithRefresh');

    util.warpToUnixTime(tokens.standardIdToken2Claims.iat);
    authInstance = new OktaAuth({
      issuer: 'https://auth-js-test.okta.com',
      clientId: 'NPSfOkH5eZrTy8PMDlvx',
    });
    authInstance.tokenManager.clear();
    oauthUtil.loadWellKnownAndKeysCache(authInstance);
  });


  it('is called when refresh token is available in browser storage', async function() {
    await authInstance.token.renewTokens();
    expect(renewTokenSpy).not.toHaveBeenCalled();

    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);
    await authInstance.token.renewTokens();

    const renewTokenArguments = renewTokenSpy.mock.calls[0];
    expect(renewTokenSpy).toHaveBeenCalled();
    expect(renewTokenArguments[2]).toMatchObject(tokens.standardRefreshTokenParsed);
  });

  it('returns tokens dict', async function() {
    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);

    const newTokens = await authInstance.token.renewTokens();
    expect(newTokens['idToken']).toEqual(tokens.standardIdTokenParsed);
    expect(newTokens['refreshToken']).toEqual(tokens.standardRefreshToken2Parsed);
  });

  it('throws when SDK has no clientId configured', async function() {
    authInstance = new OktaAuth({
      issuer: 'https://auth-js-test.okta.com',
    });
    authInstance.tokenManager.add('refreshToken', tokens.standardRefreshTokenParsed);
    await expect(authInstance.token.renewTokens()).rejects.toThrow(
      'A clientId and scopes must be specified in the OktaAuth constructor to renew tokens');
  });
});
