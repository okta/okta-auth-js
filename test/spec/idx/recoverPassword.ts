import { recoverPassword } from '../../../lib/idx/recoverPassword';
import { IdxStatus } from '../../../lib/idx/types';
import { IdxActions } from '../../../lib/idx/types/idx-js';
import { AuthSdkError } from '../../../lib/errors';

import {
  IdxResponseFactory,
  IdentifyRemediationFactory,
  IdentifyResponseFactory,
  IdentifyRecoveryRemediationFactory,
  chainResponses,
  ReEnrollPasswordAuthenticatorRemediationFactory,
  AuthenticatorVerificationDataRemediationFactory,
  SelectAuthenticatorRemediationFactory,
  IdxErrorResetPasswordNotAllowedFactory
} from '@okta/test.support/idx';

jest.mock('@okta/okta-idx-js', () => {
  const { makeIdxState } = jest.requireActual('@okta/okta-idx-js').default;
  return {
    start: () => Promise.reject(new Error('start should be mocked')),
    makeIdxState
  };
});

const mocked = {
  idx: require('@okta/okta-idx-js'),
};

describe('idx/recoverPassword', () => {
 let testContext;
  beforeEach(() => {
    const issuer = 'test-issuer';
    const clientId = 'test-clientId';
    const redirectUri = 'test-redirectUri';
    const transactionMeta = {
      issuer,
      clientId,
      redirectUri,
      interactionHandle: 'meta-interactionHandle',
      state: 'meta-state',
      codeVerifier: 'meta-code',
      scopes: ['meta'],
      urls: { authorizeUrl: 'meta-authorizeUrl' },
      ignoreSignature: true
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
      }
    };

    const identifyRecoveryResponse = IdxResponseFactory.build({
      neededToProceed: [
        IdentifyRecoveryRemediationFactory.build()
      ]
    });

    const reEnrollAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        ReEnrollPasswordAuthenticatorRemediationFactory.build()
      ]
    });

    const verificationDataResponse = IdxResponseFactory.build({
      neededToProceed: [
        AuthenticatorVerificationDataRemediationFactory.build(),
        SelectAuthenticatorRemediationFactory.build()
      ]
    });

    const actions: IdxActions = {
        // enables the recover password feature
        'currentAuthenticator-recover': () => Promise.resolve(identifyRecoveryResponse)
    };

    const identifyResponse = IdxResponseFactory.build({
      actions,
      neededToProceed: [
        IdentifyRemediationFactory.build()
      ]
    });

    testContext = {
      authClient,
      transactionMeta,
      actions,
      identifyResponse,
      identifyRecoveryResponse,
      reEnrollAuthenticatorResponse,
      verificationDataResponse
    };
  });
  
  it('throws an error if password recovery is not supported', async () => {
    const { authClient, transactionMeta } = testContext;
    jest.spyOn(mocked.idx, 'start').mockResolvedValue(IdentifyResponseFactory.build({
      actions: {
        // does not contain "currentAuthenticator-recover"
      }
    }));

    // only new transactions are checked
    jest.spyOn(authClient.transactionManager, 'exists').mockReturnValue(false);
    authClient.token = {
      prepareTokenParams: jest.fn().mockResolvedValue(transactionMeta)
    };

    const res = await recoverPassword(authClient, {});
    expect(res.status).toBe(IdxStatus.FAILURE);
    expect(res.error).toBeInstanceOf(AuthSdkError);
    expect(res.error.errorSummary).toBe('Password recovery is not supported based on your current org configuration.');
  });

  it('returns a transaction', async () => {
    const { authClient, identifyResponse } = testContext;
    jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);
    const res = await recoverPassword(authClient, {});
    expect(res).toEqual({
      status: IdxStatus.PENDING,
      tokens: null,
      nextStep: {
      'name': 'identify-recovery',
      'inputs': [
        {
          'name': 'username',
          'label': 'Username'
        }
      ],
      'canSkip': false
      }
    });
  });

  it('invokes the "currentAuthenticator-recover" action', async () => {
    const { authClient, identifyResponse } = testContext;
    jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);
    jest.spyOn(identifyResponse.actions, 'currentAuthenticator-recover');
    await recoverPassword(authClient, {});
    expect(identifyResponse.actions['currentAuthenticator-recover']).toHaveBeenCalled();
  });

  it('returns a terminal error if reset password is not allowed by server policy', async () => {
    const {
      authClient,
      identifyResponse,
      identifyRecoveryResponse,
    } = testContext;
    
    const idxError = IdxErrorResetPasswordNotAllowedFactory.build();
    jest.spyOn(identifyRecoveryResponse, 'proceed').mockRejectedValue(idxError);
    jest.spyOn(mocked.idx, 'start')
      .mockResolvedValueOnce(identifyResponse);

    const res = await recoverPassword(authClient, { username: 'myname' });
    expect(res).toEqual({
      status: IdxStatus.TERMINAL,
      tokens: null,
      error: undefined, // TOOD: is this expected?
      messages: [{
        class: 'ERROR',
        i18n: {
          key: 'unknown' // this error does not have a key
        },
        message: 'Reset password is not allowed at this time. Please contact support for assistance.'
      }]
    });
  });

  it('can proceed using username up front', async () => {
    const {
      authClient,
      identifyResponse,
      identifyRecoveryResponse,
      reEnrollAuthenticatorResponse,
    } = testContext;

    chainResponses([
      identifyRecoveryResponse,
      reEnrollAuthenticatorResponse
    ]);
    jest.spyOn(mocked.idx, 'start')
      .mockResolvedValueOnce(identifyResponse)
      .mockResolvedValueOnce(identifyRecoveryResponse);

    const res = await recoverPassword(authClient, { username: 'myname' });
    expect(res).toEqual({
      status: IdxStatus.PENDING,
      tokens: null,
      nextStep: {
        name: 'reenroll-authenticator',
        type: 'password',
        inputs: [
          {
            name: 'newPassword',
            label: 'New password',
            secret: true
          }
        ],
        canSkip: false
      }
    });
  });

  it('can proceed using username and newPassword up front', async () => {
    const {
      authClient,
      identifyResponse,
      identifyRecoveryResponse,
      reEnrollAuthenticatorResponse,
      verificationDataResponse
    } = testContext;

    chainResponses([
      identifyRecoveryResponse,
      reEnrollAuthenticatorResponse,
      verificationDataResponse
    ]);
    jest.spyOn(mocked.idx, 'start')
      .mockResolvedValueOnce(identifyResponse)
      .mockResolvedValueOnce(identifyRecoveryResponse)
      .mockResolvedValueOnce(reEnrollAuthenticatorResponse);

    jest.spyOn(identifyRecoveryResponse, 'proceed');
    jest.spyOn(reEnrollAuthenticatorResponse, 'proceed');
    
    const res = await recoverPassword(authClient, { username: 'myname', newPassword: 'newpass' });
    expect(identifyRecoveryResponse.proceed).toHaveBeenCalledWith('identify-recovery', { identifier: 'myname' });
    expect(reEnrollAuthenticatorResponse.proceed).toHaveBeenCalledWith('reenroll-authenticator', {
      credentials: {
        passcode: 'newpass'
      }
    });
    expect(res).toEqual({
      status: IdxStatus.PENDING,
      tokens: null,
      nextStep: {
        name: 'authenticator-verification-data',
        inputs: [],
        canSkip: false
      }
    });
  });

  it('can proceed using username and newPassword on demand', async () => {
    const {
      authClient,
      identifyResponse,
      identifyRecoveryResponse,
      reEnrollAuthenticatorResponse,
      verificationDataResponse
    } = testContext;

    chainResponses([
      identifyRecoveryResponse,
      reEnrollAuthenticatorResponse,
      verificationDataResponse
    ]);
    jest.spyOn(mocked.idx, 'start')
      .mockResolvedValueOnce(identifyResponse)
      .mockResolvedValueOnce(identifyRecoveryResponse)
      .mockResolvedValueOnce(reEnrollAuthenticatorResponse);

    // First call, get recovery form
    let res = await recoverPassword(authClient, {});
    expect(res).toEqual({
      status: IdxStatus.PENDING,
      tokens: null,
      nextStep: {
        name: 'identify-recovery',
        inputs: [{
          name: 'username',
          label: 'Username'
        }],
        canSkip: false
      }
    });

    // Second call, submit username
    jest.spyOn(identifyRecoveryResponse, 'proceed');
    res = await recoverPassword(authClient, { username: 'myname' });
    expect(identifyRecoveryResponse.proceed).toHaveBeenCalledWith('identify-recovery', { identifier: 'myname' });
    expect(res).toEqual({
      status: IdxStatus.PENDING,
      tokens: null,
      nextStep: {
        name: 'reenroll-authenticator',
        type: 'password',
        inputs: [
          {
            name: 'newPassword',
            label: 'New password',
            secret: true
          }
        ],
        canSkip: false
      }
    });

    // Third call, submit new password
    jest.spyOn(reEnrollAuthenticatorResponse, 'proceed');
    res = await recoverPassword(authClient, { newPassword: 'newpass' });
    expect(reEnrollAuthenticatorResponse.proceed).toHaveBeenCalledWith('reenroll-authenticator', {
      credentials: {
        passcode: 'newpass'
      }
    });
    expect(res).toEqual({
      status: IdxStatus.PENDING,
      tokens: null,
      nextStep: {
        name: 'authenticator-verification-data',
        inputs: [],
        canSkip: false
      }
    });
  });
   
});