import { authenticate } from '../../../lib/idx/authenticate';

jest.mock('../../../lib/idx/interact', () => {
  return {
    interact: () => {}
  };
});

const mocked = {
  interact: require('../../../lib/idx/interact'),
};

describe('idx/authenticate', () => {
 let testContext;
  beforeEach(() => {
    const successResponse = {
      interactionCode: 'idx-interactionCode',
      neededToProceed: []
    };
    const identifyResponse =  {
      proceed: () => Promise.resolve(successResponse),
      neededToProceed: [{
        name: 'identify',
        value:[{
          name: 'identifier',
          label: 'Username'
        }]
      }],
      rawIdxState: {}
    };
    const challengePasswordResponse = {
      proceed: () => Promise.resolve(successResponse),
      neededToProceed: [{
        name: 'challenge-authenticator',
        value: [{
          name: 'credentials'
        }],
        relatesTo: {
          value: {
            type: 'password'
          }
        }
      }],
      rawIdxState: {}
    };
    const interactResponse = {
      idxResponse: identifyResponse,
      stateHandle: 'idx-stateHandle'
    };

    jest.spyOn(mocked.interact, 'interact').mockImplementation(() => testContext.interactResponse);

    const transactionMeta = {
      state: 'meta-state',
      codeVerifier: 'meta-code',
      clientId: 'meta-clientId',
      redirectUri: 'meta-redirectUri',
      scopes: ['meta'],
      urls: { authorizeUrl: 'meta-authorizeUrl' },
      ignoreSignature: true
    };
    const tokenResponse = {
      tokens: {
        fakeToken: true
      }
    };
    const authClient = {
      transactionManager: {
        load: () => transactionMeta,
        clear: () => {}
      },
      token: {
        exchangeCodeForTokens: () => Promise.resolve(tokenResponse)
      }
    };
    jest.spyOn(authClient.token, 'exchangeCodeForTokens');

    testContext = {
      interactResponse,
      successResponse,
      identifyResponse,
      challengePasswordResponse,
      tokenResponse,
      transactionMeta,
      authClient
    };
  });
  
  it('returns an auth transaction', async () => {
    const { authClient, tokenResponse } = testContext;
    const res = await authenticate(authClient, { username: 'fake' });
    expect(res).toEqual({
      'status': 0,
      'tokens': tokenResponse.tokens,
    });
  });

  describe('basic authentication', () => {
    beforeEach(() => {
      const { identifyResponse, challengePasswordResponse } = testContext;
      identifyResponse.proceed = () => Promise.resolve(challengePasswordResponse);
      jest.spyOn(identifyResponse, 'proceed');
      jest.spyOn(challengePasswordResponse, 'proceed');
    });

    it('can authenticate, passing username and password', async () => {
      const { authClient, identifyResponse, challengePasswordResponse, tokenResponse } = testContext;
      const res = await authenticate(authClient, { username: 'fakeuser', password: 'fakepass' });
      expect(res).toEqual({
        'status': 0,
        'tokens': tokenResponse.tokens,
      });
      expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', { identifier: 'fakeuser' });
      expect(challengePasswordResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', { credentials: { passcode: 'fakepass' }});
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        clientId: 'meta-clientId',
        codeVerifier: 'meta-code',
        ignoreSignature: true,
        interactionCode: 'idx-interactionCode',
        redirectUri: 'meta-redirectUri',
        scopes: ['meta']
      }, {
        authorizeUrl: 'meta-authorizeUrl'
      });
    });
  });
});