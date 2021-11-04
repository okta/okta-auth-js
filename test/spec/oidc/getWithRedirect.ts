import { getWithRedirect } from '../../../lib/oidc/getWithRedirect';
import { TokenParams } from '../../../lib/types';

jest.mock('../../../lib/oidc/util', () => {
  return {
    prepareTokenParams: () => {},
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

describe('getWithRedirect', () => {
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
    const authorizeParams = '?fake=true';
    const urls = {
      authorizeUrl: 'http://fake-authorize'
    };
    testContext = {
      sdk,
      tokenParams,
      authorizeParams,
      urls
    };
    jest.spyOn(mocked.util, 'prepareTokenParams').mockResolvedValue(testContext.tokenParams);
    jest.spyOn(mocked.util, 'getOAuthUrls').mockReturnValue(testContext.urls);
    jest.spyOn(mocked.authorize, 'buildAuthorizeParams').mockReturnValue(testContext.authorizeParams);
  });

  it('throws an error if more than 2 parameters are passed', async () => {
    const { sdk } = testContext;
    const promise = getWithRedirect.apply(null, [sdk, {}, {}]);
    await expect(promise).rejects.toThrow('As of version 3.0, "getWithRedirect" takes only a single set of options');
  });

  describe('transactionMeta', () => {
    beforeEach(() => {
      const { sdk } = testContext;
      jest.spyOn(sdk.transactionManager, 'save');
    });
    
    it('saves issuer from sdk', async () => {
      const { sdk, urls } = testContext;
      const issuer = 'http://fake';
      sdk.options.issuer = issuer;
      await getWithRedirect(sdk, {});
      expect(sdk.transactionManager.save).toHaveBeenCalledWith({
        issuer,
        urls
      }, { oauth: true });
    });

    it('saves urls from `getOAuthUrls`', async () => {
      const { sdk, urls } = testContext;
      const options = { foo: 'bar' } as unknown as TokenParams;
      await getWithRedirect(sdk, options);
      expect(mocked.util.getOAuthUrls).toHaveBeenCalledWith(sdk, options);
      expect(sdk.transactionManager.save).toHaveBeenCalledWith({
        urls
      }, { oauth: true });
    });

    it('saves OAuth values from the tokenParams', async () => {
      const { sdk, urls, tokenParams } = testContext;
      Object.assign(tokenParams, {
        responseType: 'code',
        state: 'mock-state',
        nonce: 'mock-nonce',
        scopes: ['a', 'b'],
        clientId: 'mock-clientId',
        ignoreSignature: true,
        redirectUri: 'http://localhost/login/callback',
        codeVerifier: 'abcd',
        codeChallenge: 'efgh',
        codeChallengeMethod: 'fake',
      });

      await getWithRedirect(sdk, {});
      expect(sdk.transactionManager.save).toHaveBeenCalledWith({
        responseType: 'code',
        state: 'mock-state',
        nonce: 'mock-nonce',
        scopes: ['a', 'b'],
        clientId: 'mock-clientId',
        ignoreSignature: true,
        redirectUri: 'http://localhost/login/callback',
        codeVerifier: 'abcd',
        codeChallenge: 'efgh',
        codeChallengeMethod: 'fake',
        urls
      }, { oauth: true });
    });
  });


  it('redirects to the authorize endpoint', async () => {
    const { sdk, tokenParams } = testContext;
    jest.spyOn(sdk.token.getWithRedirect, '_setLocation');
    await getWithRedirect(sdk, {});
    expect(mocked.authorize.buildAuthorizeParams).toHaveBeenCalledWith(tokenParams);
    expect(sdk.token.getWithRedirect._setLocation).toHaveBeenCalledWith('http://fake-authorize?fake=true');
  });

});