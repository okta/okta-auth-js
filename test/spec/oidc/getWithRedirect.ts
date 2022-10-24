import { getWithRedirect } from '../../../lib/oidc/getWithRedirect';

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

describe('getWithRedirect', () => {
  let testContext;
  beforeEach(() => {
    const sdk = {
      options: {
        setLocation: jest.fn()
      },
      getOriginalUri: () => {},
      transactionManager: {
        save: () => {}
      }
    };
    const tokenParams = {
      ignoreSignatue: true
    };
    const authorizeParams = '?fake=true';
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
      urls,
      meta
    };
    jest.spyOn(mocked.util, 'prepareTokenParams').mockResolvedValue(testContext.tokenParams);
    jest.spyOn(mocked.util, 'getOAuthUrls').mockReturnValue(testContext.urls);
    jest.spyOn(mocked.authorize, 'buildAuthorizeParams').mockReturnValue(testContext.authorizeParams);
    jest.spyOn(mocked.util, 'createOAuthMeta').mockReturnValue(testContext.meta);
  });

  it('throws an error if more than 2 parameters are passed', async () => {
    const { sdk } = testContext;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const promise = getWithRedirect.apply(null, [sdk, {}, {}]);
    await expect(promise).rejects.toThrow('As of version 3.0, "getWithRedirect" takes only a single set of options');
  });

  describe('transactionMeta', () => {
    beforeEach(() => {
      const { sdk } = testContext;
      jest.spyOn(sdk.transactionManager, 'save');
    });
    
    it('saves the transaction meta', async () => {
      const { sdk, meta } = testContext;
      const issuer = 'http://fake';
      sdk.options.issuer = issuer;
      await getWithRedirect(sdk, {});
      expect(sdk.transactionManager.save).toHaveBeenCalledWith(meta);
    });

  });


  it('redirects to the authorize endpoint', async () => {
    const { sdk, tokenParams } = testContext;
    await getWithRedirect(sdk, {});
    expect(mocked.authorize.buildAuthorizeParams).toHaveBeenCalledWith(tokenParams);
    expect(sdk.options.setLocation).toHaveBeenCalledWith('http://fake-authorize?fake=true');
  });

});