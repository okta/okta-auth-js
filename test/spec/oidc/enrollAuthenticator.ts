import { enrollAuthenticator } from '../../../lib/oidc/enrollAuthenticator';

jest.mock('../../../lib/oidc/util', () => {
  return {
    prepareTokenParams: () => {},
    createOAuthMeta: () => {},
    getOAuthUrls: () => {}
  };
});

jest.mock('../../../lib/oidc/endpoints/authorize', () => {
  return {
    buildAuthorizeParams: () => {}
  };
});

const mocked = {
  util: require('../../../lib/oidc/util'),
  authorize: require('../../../lib/oidc/endpoints/authorize')
};

describe('enrollAuthenticator', () => {
  let testContext;
  beforeEach(() => {
    const sdk = {
      options: {
        issuer: 'http://fake',
        clientId: 'fakeClientId',
        redirectUri: 'http://fake-redirect',
      },
      transactionManager: {
        save: () => {}
      },
      token: {
        enrollAuthenticator: {
          _setLocation: () => {}
        }
      }
    };
    const tokenParams = {
      clientId: 'fakeClientId',
      responseType: 'none',
      prompt: 'enroll_authenticator',
      enrollAmrValues: ['okta_verify']
    };
    const enrollParams = {
      enrollAmrValues: ['okta_verify']
    };
    const authorizeParams = '?client_id=fakeClientId&prompt=enroll_authenticator&response_type=none&enroll_amr_values=okta_verify';
    const urls = {
      authorizeUrl: 'http://fake-authorize'
    };
    const meta = {
      urls
    };
    testContext = {
      sdk,
      tokenParams,
      authorizeParams,
      enrollParams,
      urls,
      meta
    };
    jest.spyOn(mocked.util, 'prepareTokenParams').mockResolvedValue(testContext.tokenParams);
    jest.spyOn(mocked.util, 'getOAuthUrls').mockReturnValue(testContext.urls);
    jest.spyOn(mocked.authorize, 'buildAuthorizeParams').mockReturnValue(testContext.authorizeParams);
    jest.spyOn(mocked.util, 'createOAuthMeta').mockReturnValue(testContext.meta);
  });

  describe('transactionMeta', () => {
    beforeEach(() => {
      const { sdk } = testContext;
      jest.spyOn(sdk.transactionManager, 'save');
    });
    
    it('saves the transaction meta', async () => {
      const { sdk, meta, enrollParams } = testContext;
      await enrollAuthenticator(sdk, enrollParams);
      expect(sdk.transactionManager.save).toHaveBeenCalledWith(meta);
    });
  });

  it('overrides prompt with enroll_authenticator', async () => {
    const { sdk, enrollParams } = testContext;
    const badEnrollParams = {
      ...enrollParams,
      prompt: 'none'
    };
    const tokenParams = {
      ...badEnrollParams,
      prompt: 'enroll_authenticator'
    };
    await enrollAuthenticator(sdk, badEnrollParams);
    expect(mocked.util.prepareTokenParams).toHaveBeenCalledWith(sdk, tokenParams);
  });

  it('redirects to the authorize endpoint', async () => {
    const { sdk, tokenParams, enrollParams, authorizeParams } = testContext;
    jest.spyOn(sdk.token.enrollAuthenticator, '_setLocation');
    await enrollAuthenticator(sdk, enrollParams);
    expect(mocked.authorize.buildAuthorizeParams).toHaveBeenCalledWith(tokenParams);
    expect(sdk.token.enrollAuthenticator._setLocation).toHaveBeenCalledWith(`http://fake-authorize${authorizeParams}`);
  });

});