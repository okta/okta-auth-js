import { register } from '../../../lib/idx/register';
import { IdxStatus } from '../../../lib/idx/types';
import { AuthSdkError } from '../../../lib/errors';

import {
  SuccessResponseFactory,
  IdxResponseFactory,
  IdentifyRemediationFactory,
  SelectEnrollProfileRemediationFactory,
  EnrollProfileRemediationFactory,
  chainResponses,
  SelectAuthenticatorRemediationFactory,
  EnrollEmailAuthenticatorRemediationFactory
} from '@okta/test.support/idx';


jest.mock('@okta/okta-idx-js', () => {
  return {
    start: () => {}
  };
});

const mocked = {
  idx: require('@okta/okta-idx-js'),
};

describe('idx/register', () => {
 let testContext;
  beforeEach(() => {
    const issuer = 'test-issuer';
    const clientId = 'test-clientId';
    const redirectUri = 'test-redirectUri';
    const transactionMeta = {
      issuer,
      clientId,
      redirectUri,
      state: 'meta-state',
      codeVerifier: 'meta-code',
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
      options: {
        issuer,
        clientId,
        redirectUri
      },
      transactionManager: {
        exists: () => true,
        load: () => transactionMeta,
        clear: () => {},
        save: () => {}
      },
      token: {
        exchangeCodeForTokens: () => Promise.resolve(tokenResponse)
      }
    };
    jest.spyOn(authClient.token, 'exchangeCodeForTokens');

    const interactionCode = 'test-interactionCode';
    const successResponse = SuccessResponseFactory.build({
      interactionCode
    });

    const identifyResponse = IdxResponseFactory.build({
      neededToProceed: [
        IdentifyRemediationFactory.build(),
        SelectEnrollProfileRemediationFactory.build()
      ]
    });

    const enrollProfileResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollProfileRemediationFactory.build()
      ]
    });

    const selectAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        SelectAuthenticatorRemediationFactory.build({
          name: 'select-authenticator-enroll'
        })
      ]
    });

    const enrollAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollEmailAuthenticatorRemediationFactory.build()
      ]
    });

    testContext = {
      authClient,
      transactionMeta,
      tokenResponse,
      successResponse,
      interactionCode,
      identifyResponse,
      enrollProfileResponse,
      selectAuthenticatorResponse,
      enrollAuthenticatorResponse
    };
  });
  
  it('throws an error if registration is not supported', async () => {
    const { authClient, transactionMeta } = testContext;
    jest.spyOn(authClient.transactionManager, 'exists').mockReturnValue(false);
    authClient.token.prepareTokenParams = jest.fn().mockResolvedValue(transactionMeta);
    const identifyResponse = IdxResponseFactory.build({
      neededToProceed: [
        IdentifyRemediationFactory.build(),
        // does not contain select-enroll-profile
      ]
    });
    jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);
    const res = await register(authClient, {});
    expect(res.status).toBe(IdxStatus.FAILURE);
    expect(res.error).toBeInstanceOf(AuthSdkError);
    expect(res.error.errorSummary).toBe('Registration is not supported based on your current org configuration.');
  });

  it('can register, passing firstName, lastName, and email up front', async () => {
    const {
      authClient,
      identifyResponse,
      enrollProfileResponse,
      selectAuthenticatorResponse,
      enrollAuthenticatorResponse,
      successResponse,
      tokenResponse,
      interactionCode
    } = testContext;

    chainResponses([
      identifyResponse,
      enrollProfileResponse,
      selectAuthenticatorResponse,
      enrollAuthenticatorResponse,
      successResponse
    ]);
    jest.spyOn(identifyResponse, 'proceed');
    jest.spyOn(enrollProfileResponse, 'proceed');
    jest.spyOn(selectAuthenticatorResponse, 'proceed');
    jest.spyOn(enrollAuthenticatorResponse, 'proceed');
    jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);
    let res = await register(authClient, {
      firstName: 'Bob',
      lastName: 'Lawbla',
      email: 'boblawbla@bobslawblog.com',
      authenticators: ['email']
    });
    expect(res.status).toBe(IdxStatus.PENDING);
    expect(res.nextStep).toEqual({
      canSkip: false,
      name: 'enroll-authenticator',
      type: 'email',
      inputs: [{
        name: 'verificationCode',
        required: true,
        type: 'string',
        value: 'id-email'
      }]
    });
    expect(identifyResponse.proceed).toHaveBeenCalledWith('select-enroll-profile', { });
    expect(enrollProfileResponse.proceed).toHaveBeenCalledWith('enroll-profile', {
      userProfile: {
        email: 'boblawbla@bobslawblog.com',
        firstName: 'Bob',
        lastName: 'Lawbla'
      }
    });
    expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
      authenticator: {
        id: 'id-email'
      }
    });

    const verificationCode = 'test-code';
    res = await register(authClient, { verificationCode, authenticators: ['email'] });
    expect(enrollAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
      credentials: {
        passcode: 'test-code'
      }
    });
    expect(res).toEqual({
      'status': 0,
      'tokens': tokenResponse.tokens,
    });
    expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
      clientId: 'test-clientId',
      redirectUri: 'test-redirectUri',
      codeVerifier: 'meta-code',
      ignoreSignature: true,
      interactionCode,
      scopes: ['meta']
    }, {
      authorizeUrl: 'meta-authorizeUrl'
    });
  });

  // eslint-disable-next-line jasmine/no-disabled-tests
  xit('can register, passing firstName, lastName, and email on demand', async () => {
    // TODO
  });
   
});