import { RawIdxResponseFactory } from '@okta/test.support/idx';
import { introspect } from '../../../lib/idx/introspect';

jest.mock('@okta/okta-idx-js', () => {
  const { makeIdxState } = jest.requireActual('@okta/okta-idx-js').default;
  return {
    introspect: () => {},
    makeIdxState
  };
});
jest.mock('../../../lib/oidc', () => {
  return {
    getOAuthDomain: () => {}
  }
});

const mocked = {
  idx: require('@okta/okta-idx-js'),
  oidc: require('../../../lib/oidc')
};

describe('idx/introspect', () => {
  let testContext;
  beforeEach(() => {
    const authClient = {
      transactionManager: {
        loadIdxResponse: () => {}
      }
    };

    const introspectOptions = {
      interactionHandle: 'interaction-handle'
    };

    jest.spyOn(mocked.oidc, 'getOAuthDomain').mockReturnValue('mock-domain');

    testContext = {
      authClient,
      introspectOptions
    };
  });

  it('returns idxResponse from storage if it exists', async () => {
    const { authClient, introspectOptions } = testContext;
    jest.spyOn(mocked.idx, 'introspect');
    const rawIdxResponse = RawIdxResponseFactory.build();
    authClient.transactionManager.loadIdxResponse = jest.fn().mockReturnValue(rawIdxResponse);
    const res = await introspect(authClient, introspectOptions);
    expect(authClient.transactionManager.loadIdxResponse).toHaveBeenCalled();
    expect(mocked.idx.introspect).not.toHaveBeenCalled();
    expect(res.rawIdxState).toEqual(rawIdxResponse);
  });

  it('calls idx.introspect when idx states not in storage', async () => {
    const { authClient, introspectOptions } = testContext;
    const rawIdxResponse = RawIdxResponseFactory.build();
    jest.spyOn(mocked.idx, 'introspect').mockResolvedValue(rawIdxResponse);
    authClient.transactionManager.loadIdxResponse = jest.fn().mockReturnValue(null);
    const res = await introspect(authClient, introspectOptions);
    expect(authClient.transactionManager.loadIdxResponse).toHaveBeenCalled();
    expect(mocked.idx.introspect).toHaveBeenCalledWith({
      domain: 'mock-domain',
      interactionHandle: 'interaction-handle',
      version: '1.0.0',
    });
    expect(res.rawIdxState).toEqual(rawIdxResponse);
  });
});
