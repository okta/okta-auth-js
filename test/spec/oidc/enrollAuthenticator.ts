import { enrollAuthenticator } from '../../../lib/oidc/enrollAuthenticator';

jest.mock('../../../lib/oidc/util', () => {
  return {
    prepareEnrollAuthenticatorParams: () => {},
    createEnrollAuthenticatorMeta: () => {},
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
    const preparedParams = {
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
      preparedParams,
      authorizeParams,
      enrollParams,
      urls,
      meta
    };
    jest.spyOn(mocked.util, 'prepareEnrollAuthenticatorParams').mockReturnValue(testContext.preparedParams);
    jest.spyOn(mocked.util, 'getOAuthUrls').mockReturnValue(testContext.urls);
    jest.spyOn(mocked.authorize, 'buildAuthorizeParams').mockReturnValue(testContext.authorizeParams);
    jest.spyOn(mocked.util, 'createEnrollAuthenticatorMeta').mockReturnValue(testContext.meta);
  });

  afterEach(() => {
    global.window.location = originalLocation;
  });

  describe('transactionMeta', () => {
    beforeEach(() => {
      const { sdk } = testContext;
      jest.spyOn(sdk.transactionManager, 'save');
    });
    
    it('saves the transaction meta', () => {
      const { sdk, meta, enrollParams } = testContext;
      enrollAuthenticator(sdk, enrollParams);
      expect(sdk.transactionManager.save).toHaveBeenCalledWith(meta);
    });
  });

  it('redirects to the authorize endpoint with options.setLocation', () => {
    const { sdk, preparedParams, enrollParams, authorizeParams } = testContext;
    sdk.options.setLocation = jest.fn();
    enrollAuthenticator(sdk, enrollParams);
    expect(mocked.authorize.buildAuthorizeParams).toHaveBeenCalledWith(preparedParams);
    expect(sdk.options.setLocation).toHaveBeenCalledWith(`http://fake-authorize${authorizeParams}`);
  });

  it('redirects to the authorize endpoint with window.location.assign if options.setLocation is not set', () => {
    const { sdk, preparedParams, enrollParams, authorizeParams } = testContext;
    enrollAuthenticator(sdk, enrollParams);
    expect(mocked.authorize.buildAuthorizeParams).toHaveBeenCalledWith(preparedParams);
    expect(window.location.assign).toHaveBeenCalledWith(`http://fake-authorize${authorizeParams}`);
  });

});