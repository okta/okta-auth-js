import { authenticate } from '../../../lib/idx/authenticate';
import {
  SuccessResponseFactory,
  IdentifyResponseFactory,
  VerifyPasswordResponseFactory
} from '@okta/test.support/idx';

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
    const interactionCode = 'test-interactionCode';
    const stateHandle = 'test-stateHandle';
    const successResponse = SuccessResponseFactory.build({
      interactionCode
    });
    const identifyResponse =  IdentifyResponseFactory.build({
      proceed: () => Promise.resolve(successResponse),
    });
    const verifyPasswordResponse = VerifyPasswordResponseFactory.build({
      proceed: () => Promise.resolve(successResponse)
    });
    const interactResponse = {
      idxResponse: identifyResponse,
      stateHandle 
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
      interactionCode,
      interactResponse,
      successResponse,
      identifyResponse,
      verifyPasswordResponse,
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
      const { identifyResponse, verifyPasswordResponse } = testContext;
      identifyResponse.proceed = () => Promise.resolve(verifyPasswordResponse);
      jest.spyOn(identifyResponse, 'proceed');
      jest.spyOn(verifyPasswordResponse, 'proceed');
    });

    it('can authenticate, passing username and password', async () => {
      const { authClient, identifyResponse, verifyPasswordResponse, tokenResponse, interactionCode } = testContext;
      const res = await authenticate(authClient, { username: 'fakeuser', password: 'fakepass' });
      expect(res).toEqual({
        'status': 0,
        'tokens': tokenResponse.tokens,
      });
      expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', { identifier: 'fakeuser' });
      expect(verifyPasswordResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', { credentials: { passcode: 'fakepass' }});
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        clientId: 'meta-clientId',
        codeVerifier: 'meta-code',
        ignoreSignature: true,
        interactionCode,
        redirectUri: 'meta-redirectUri',
        scopes: ['meta']
      }, {
        authorizeUrl: 'meta-authorizeUrl'
      });
    });
  });
});