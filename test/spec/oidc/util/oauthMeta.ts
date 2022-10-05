import { createOAuthMeta } from '../../../../lib/oidc/util/oauthMeta';

jest.mock('../../../../lib/oidc/util/oauth', () => {
  return {
    getOAuthUrls: () => {}
  };
});


const mocked = {
  oauth: require('../../../../lib/oidc/util/oauth'),
};

describe('oauthMeta', () => {
  let testContext;
  beforeEach(() => {
    const sdk = {
      options: {

      },
      getOriginalUri: () => {},
      transactionManager: {
        save: () => {}
      },
      token: {
        getWithRedirect: {
          _setLocation: () => {}
        }
      }
    };
    const tokenParams = {
      ignoreSignatue: true
    };
    const urls = {
      authorizeUrl: 'http://fake-authorize'
    };
    testContext = {
      sdk,
      tokenParams,
      urls,
    };
  });

  it('saves issuer from sdk', async () => {
    const { sdk, tokenParams } = testContext;
    const issuer = 'http://fake';
    sdk.options.issuer = issuer;
    const meta = createOAuthMeta(sdk, tokenParams);
    expect(meta.issuer).toBe(issuer);
  });

  it('saves urls from `getOAuthUrls`', async () => {
    const { sdk, urls, tokenParams } = testContext;
    jest.spyOn(mocked.oauth, 'getOAuthUrls').mockReturnValue(urls);
    const meta = createOAuthMeta(sdk, tokenParams);
    expect(mocked.oauth.getOAuthUrls).toHaveBeenCalledWith(sdk, tokenParams);
    expect(meta.urls).toEqual(urls);
  });

  it('saves OAuth values from the tokenParams', async () => {
    const { sdk, tokenParams } = testContext;
    Object.assign(tokenParams, {
      responseType: 'code',
      responseMode: 'fragment',
      state: 'mock-state',
      nonce: 'mock-nonce',
      scopes: ['a', 'b'],
      clientId: 'mock-clientId',
      ignoreSignature: true,
      redirectUri: 'http://localhost/login/callback',
      codeVerifier: 'abcd',
      codeChallenge: 'efgh',
      codeChallengeMethod: 'fake',
      acrValues: 'foo',
    });

    const meta = createOAuthMeta(sdk, tokenParams);
    expect(meta).toEqual({
      responseType: 'code',
      responseMode: 'fragment',
      state: 'mock-state',
      nonce: 'mock-nonce',
      scopes: ['a', 'b'],
      clientId: 'mock-clientId',
      ignoreSignature: true,
      redirectUri: 'http://localhost/login/callback',
      codeVerifier: 'abcd',
      codeChallenge: 'efgh',
      codeChallengeMethod: 'fake',
      acrValues: 'foo',
    });
  });
});
