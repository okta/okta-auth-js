/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


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
  SelectAuthenticatorAuthenticateRemediationFactory,
  IdxErrorResetPasswordNotAllowedFactory,
  RawIdxResponseFactory,
  IdxMessagesFactory,
  IdxErrorNoAccountWithUsernameFactory,
  AuthenticatorValueFactory,
  OktaVerifyAuthenticatorOptionFactory,
  PhoneAuthenticatorOptionFactory,
  EmailAuthenticatorOptionFactory,
  PasswordAuthenticatorVerificationDataRemediationFactory
} from '@okta/test.support/idx';

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect')
};

describe('idx/recoverPassword', () => {
 let testContext;
  beforeEach(() => {
    const issuer = 'https://test-issuer';
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
        save: () => {},
        saveIdxResponse: () => {}
      }
    };

    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({ 
      meta: transactionMeta,
      interactionHandle: transactionMeta.interactionHandle,
      state: transactionMeta.state
    });

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
        PasswordAuthenticatorVerificationDataRemediationFactory.build(),
        SelectAuthenticatorAuthenticateRemediationFactory.build({
          value: [
            AuthenticatorValueFactory.build({
              options: [
                OktaVerifyAuthenticatorOptionFactory.build(),
                PhoneAuthenticatorOptionFactory.build(),
                EmailAuthenticatorOptionFactory.build(),
              ]
            })
          ]
        })
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
  
  // TODO: revisit how to expose enabledFeatures for password recovery
  // JIRA: https://oktainc.atlassian.net/browse/OKTA-400605
  // current implementation cannot support password recovery enabledFeatures for the identifier first flow
  // solution: detect enabledFeatures in the Remediator level, then aggregate the results
  // eslint-disable-next-line jasmine/no-disabled-tests
  xit('throws an error if password recovery is not supported', async () => {
    const { authClient, transactionMeta } = testContext;
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(IdentifyResponseFactory.build({
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
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(identifyResponse);
    const res = await recoverPassword(authClient, {});
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      status: IdxStatus.PENDING,
      nextStep: {
        name: 'identify-recovery',
        inputs: [
          {
            'name': 'username',
            'label': 'Username'
          }
        ],
      }
    });
  });

  it('invokes the "currentAuthenticator-recover" action', async () => {
    const { authClient, identifyResponse } = testContext;
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(identifyResponse);
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
    
    const idxError = IdxResponseFactory.build({
      rawIdxState: RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxErrorResetPasswordNotAllowedFactory.build()
          ]
        })
      })
    });

    jest.spyOn(identifyRecoveryResponse, 'proceed').mockRejectedValue(idxError);
    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(identifyResponse);

    const res = await recoverPassword(authClient, { username: 'myname' });
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      status: IdxStatus.TERMINAL,
      messages: [{
        class: 'ERROR',
        i18n: {
          key: undefined // this error does not have a key
        },
        message: 'Reset password is not allowed at this time. Please contact support for assistance.'
      }]
    });
  });

  it('returns a pending status with error message if a bad username was submitted', async () => {
    const {
      authClient,
      identifyResponse,
      identifyRecoveryResponse,
    } = testContext;
    
    const username = 'incorrect@wrong.com';

    // messages appear in the "rawIdxState"
    const rawIdxState = RawIdxResponseFactory.build({
      messages: IdxMessagesFactory.build({
        value: [
          IdxErrorNoAccountWithUsernameFactory.build({}, {
            transient: {
              username
            }
          })
        ]
      })
    });
    const errorResponse = Object.assign({}, identifyRecoveryResponse, { rawIdxState });

    jest.spyOn(identifyRecoveryResponse, 'proceed').mockResolvedValueOnce(errorResponse);
    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(identifyResponse);

    const res = await recoverPassword(authClient, { username });
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      status: IdxStatus.PENDING,
      nextStep: {
        name: 'identify-recovery',
        inputs: [{
          name: 'username',
          label: 'Username'
        }],
      },
      messages: [{
        class: 'INFO',
        i18n: {
          key: 'idx.unknown.user',
          params: []
        },
        message: 'There is no account with the Username incorrect@wrong.com.'
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
    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(identifyResponse)
      .mockResolvedValueOnce(identifyRecoveryResponse);

    const res = await recoverPassword(authClient, { username: 'myname' });
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      status: IdxStatus.PENDING,
      nextStep: {
        name: 'reenroll-authenticator',
        type: 'password',
        authenticator: {
          displayName: 'Password',
          id: '14',
          key: 'okta_password',
          methods: [
            {
              type: 'password',
            },
          ],
          settings: {
            age: {
              historyCount: 4,
              minAgeMinutes: 0,
            },
            complexity: {
              excludeAttributes: [],
              excludeUsername: true,
              minLength: 8,
              minLowerCase: 0,
              minNumber: 0,
              minSymbol: 0,
              minUpperCase: 0,
            },
          },
          type: 'password',
        },
        inputs: [
          {
            name: 'newPassword',
            label: 'New password',
            secret: true
          }
        ],
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
    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(identifyResponse)
      .mockResolvedValueOnce(identifyRecoveryResponse)
      .mockResolvedValueOnce(reEnrollAuthenticatorResponse);

    jest.spyOn(identifyRecoveryResponse, 'proceed');
    jest.spyOn(reEnrollAuthenticatorResponse, 'proceed');

    const res = await recoverPassword(authClient, { username: 'myname', newPassword: 'newpass' });
    expect(identifyRecoveryResponse.proceed)
      .toHaveBeenCalledWith('identify-recovery', { identifier: 'myname' });
    expect(reEnrollAuthenticatorResponse.proceed)
      .toHaveBeenCalledWith('reenroll-authenticator', {
        credentials: {
          passcode: 'newpass'
        }
      });
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      status: IdxStatus.PENDING,
      nextStep: {
        name: 'authenticator-verification-data',
        type: 'password',
        authenticator: {
          displayName: 'Password',
          id: '15',
          key: 'okta_password',
          methods: [
            {
              type: 'password',
            },
          ],
          settings: {
            age: {
              historyCount: 4,
              minAgeMinutes: 0,
            },
            complexity: {
              excludeAttributes: [],
              excludeUsername: true,
              minLength: 8,
              minLowerCase: 0,
              minNumber: 0,
              minSymbol: 0,
              minUpperCase: 0,
            },
          },
          type: 'password',
        },
        inputs: [{
          label: 'Password',
          name: 'passcode',
          secret: true
        }],
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
    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(identifyResponse)
      .mockResolvedValueOnce(identifyRecoveryResponse)
      .mockResolvedValueOnce(reEnrollAuthenticatorResponse);

    // First call, get recovery form
    let res = await recoverPassword(authClient, {});
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      status: IdxStatus.PENDING,
      nextStep: {
        name: 'identify-recovery',
        inputs: [{
          name: 'username',
          label: 'Username'
        }],
      }
    });

    // Second call, submit username
    jest.spyOn(identifyRecoveryResponse, 'proceed');
    res = await recoverPassword(authClient, { username: 'myname' });
    expect(identifyRecoveryResponse.proceed).toHaveBeenCalledWith('identify-recovery', { identifier: 'myname' });
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      status: IdxStatus.PENDING,
      nextStep: {
        name: 'reenroll-authenticator',
        type: 'password',
        authenticator: {
          displayName: 'Password',
          id: '14',
          key: 'okta_password',
          methods: [
            {
              type: 'password',
            },
          ],
          settings: {
            age: {
              historyCount: 4,
              minAgeMinutes: 0,
            },
            complexity: {
              excludeAttributes: [],
              excludeUsername: true,
              minLength: 8,
              minLowerCase: 0,
              minNumber: 0,
              minSymbol: 0,
              minUpperCase: 0,
            },
          },
          type: 'password',
        },
        inputs: [
          {
            name: 'newPassword',
            label: 'New password',
            secret: true
          }
        ],
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
      _idxResponse: expect.any(Object),
      status: IdxStatus.PENDING,
      nextStep: {
        name: 'authenticator-verification-data',
        type: 'password',
        authenticator: {
          displayName: 'Password',
          id: '15',
          key: 'okta_password',
          methods: [
            {
              type: 'password',
            },
          ],
          settings: {
            age: {
              historyCount: 4,
              minAgeMinutes: 0,
            },
            complexity: {
              excludeAttributes: [],
              excludeUsername: true,
              minLength: 8,
              minLowerCase: 0,
              minNumber: 0,
              minSymbol: 0,
              minUpperCase: 0,
            },
          },
          type: 'password',
        },
        inputs: [{
          label: 'Password',
          name: 'passcode',
          secret: true
        }],
      }
    });
  });
   
});