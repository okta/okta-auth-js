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
  let originalLocation;
  beforeEach(() => {
    originalLocation = global.window.location;
    delete (global.window as any).location;
    global.window.location = {
      protocol: 'https:',
      hostname: 'somesite.local',
      href: 'https://somesite.local',
      assign: jest.fn()
    } as unknown as Location;

    const sdk = {
      options: {
        issuer: 'http://fake',
        clientId: 'fakeClientId',
        redirectUri: 'http://fake-redirect'
      },
      transactionManager: {
        save: () => {}
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

  afterEach(() => {
    global.window.location = originalLocation;
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

  it('redirects to the authorize endpoint with options.setLocation', async () => {
    const { sdk, tokenParams, enrollParams, authorizeParams } = testContext;
    sdk.options.setLocation = jest.fn();
    await enrollAuthenticator(sdk, enrollParams);
    expect(mocked.authorize.buildAuthorizeParams).toHaveBeenCalledWith(tokenParams);
    expect(sdk.options.setLocation).toHaveBeenCalledWith(`http://fake-authorize${authorizeParams}`);
  });

  it('redirects to the authorize endpoint with window.location.assign if options.setLocation is not set', async () => {
    const { sdk, tokenParams, enrollParams, authorizeParams } = testContext;
    await enrollAuthenticator(sdk, enrollParams);
    expect(mocked.authorize.buildAuthorizeParams).toHaveBeenCalledWith(tokenParams);
    expect(window.location.assign).toHaveBeenCalledWith(`http://fake-authorize${authorizeParams}`);
  });

});