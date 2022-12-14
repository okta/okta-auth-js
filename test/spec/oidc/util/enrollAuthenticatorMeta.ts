import { createEnrollAuthenticatorMeta } from '../../../../lib/oidc/util/enrollAuthenticatorMeta';

jest.mock('../../../../lib/oidc/util/oauth', () => {
  return {
    getOAuthUrls: () => {}
  };
});


const mocked = {
  oauth: require('../../../../lib/oidc/util/oauth'),
};

describe('enrollAuthenticatorMeta', () => {
  let testContext;
  beforeEach(() => {
    const sdk = {
      options: {
      },
    };
    const enrollAuthenticatorOptions = {
    };
    const urls = {
      authorizeUrl: 'http://fake-authorize'
    };
    testContext = {
      sdk,
      enrollAuthenticatorOptions,
      urls,
    };
  });

  it('saves issuer from sdk', async () => {
    const { sdk, enrollAuthenticatorOptions } = testContext;
    const issuer = 'http://fake';
    sdk.options.issuer = issuer;
    const meta = createEnrollAuthenticatorMeta(sdk, enrollAuthenticatorOptions);
    expect(meta.issuer).toBe(issuer);
  });

  it('saves urls from `getOAuthUrls`', async () => {
    const { sdk, urls, enrollAuthenticatorOptions } = testContext;
    jest.spyOn(mocked.oauth, 'getOAuthUrls').mockReturnValue(urls);
    const meta = createEnrollAuthenticatorMeta(sdk, enrollAuthenticatorOptions);
    expect(mocked.oauth.getOAuthUrls).toHaveBeenCalledWith(sdk, enrollAuthenticatorOptions);
    expect(meta.urls).toEqual(urls);
  });

  it('saves OAuth values from the enrollAuthenticatorOptions', async () => {
    const { sdk, enrollAuthenticatorOptions } = testContext;
    Object.assign(enrollAuthenticatorOptions, {
      responseType: 'none',
      responseMode: 'query',
      state: 'mock-state',
      clientId: 'mock-clientId',
      redirectUri: 'http://localhost/login/callback',
      acrValues: 'foo',
      enrollAmrValues: ['a', 'b']
    });

    const meta = createEnrollAuthenticatorMeta(sdk, enrollAuthenticatorOptions);
    expect(meta).toEqual({
      responseType: 'none',
      responseMode: 'query',
      state: 'mock-state',
      clientId: 'mock-clientId',
      redirectUri: 'http://localhost/login/callback',
      acrValues: 'foo',
      enrollAmrValues: ['a', 'b']
    });
  });
});
