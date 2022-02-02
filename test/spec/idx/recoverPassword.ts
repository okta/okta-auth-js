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

import {
  IdxResponseFactory,
  IdentifyRemediationFactory,
  IdentifyRecoveryRemediationFactory,
  chainResponses,
  SelectAuthenticatorAuthenticateRemediationFactory,
  IdxErrorResetPasswordNotAllowedFactory,
  RawIdxResponseFactory,
  IdxMessagesFactory,
  IdxErrorNoAccountWithUsernameFactory,
  AuthenticatorValueFactory,
  OktaVerifyAuthenticatorOptionFactory,
  PhoneAuthenticatorOptionFactory,
  EmailAuthenticatorOptionFactory,
  VerifyEmailRemediationFactory,
  ResetAuthenticatorRemediationFactory,
  PasswordAuthenticatorFactory,
  NewPasswordValueFactory,
  CredentialsValueFactory,
  PasswordAuthenticatorOptionFactory,
  VerifyPasswordRemediationFactory
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
      },
      idx: {
        setFlow: () => {}
      },
      token: {
        exchangeCodeForTokens: jest.fn().mockReturnValue({
          tokens: {}
        })
      }
    };

    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({ 
      meta: transactionMeta,
      interactionHandle: transactionMeta.interactionHandle,
      state: transactionMeta.state
    });

    const selectAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
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

    const verifyEmailResponse = IdxResponseFactory.build({
      neededToProceed: [
        VerifyEmailRemediationFactory.build()
      ]
    });

    const resetAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        ResetAuthenticatorRemediationFactory.build({
          relatesTo: {
            type: 'object',
            value: PasswordAuthenticatorFactory.build()
          },
          value: [
            CredentialsValueFactory.build({
              form: {
                value: [
                  NewPasswordValueFactory.build()
                ]
              }
            })
          ]
        })
      ]
    });

    const successResponse = IdxResponseFactory.build({
      interactionCode: 'test-interactionCode'
    });

    testContext = {
      authClient,
      transactionMeta,
      selectAuthenticatorResponse,
      verifyEmailResponse,
      resetAuthenticatorResponse,
      successResponse
    };
  });

  describe('recovery token', () => {
    beforeEach(() => {
      const { authClient: { transactionManager } } = testContext;
      transactionManager.exists = () => false;
      transactionManager.load = () => {};
      const idxError = IdxResponseFactory.build({
        rawIdxState: RawIdxResponseFactory.build({
          messages: IdxMessagesFactory.build({
            value: [
              IdxErrorResetPasswordNotAllowedFactory.build()
            ]
          })
        })
      });
      jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxError);
    });

    it('by default it does not pass a recoveryToken to interact', async () => {
      const { authClient } = testContext;
      await recoverPassword(authClient, {});
      expect(mocked.interact.interact).toHaveBeenCalledWith(authClient, { withCredentials: false });
    });

    it('can pass recoveryToken to interact', async () => {
      const { authClient } = testContext;
      const recoveryToken = 'abc';
      await recoverPassword(authClient, { recoveryToken });
      expect(mocked.interact.interact).toHaveBeenCalledWith(authClient, { withCredentials: false, recoveryToken });
    });
  });
  describe('classic org policy', () => {
    beforeEach(() => {
      const identifyRecoveryResponse = IdxResponseFactory.build({
        neededToProceed: [
          IdentifyRecoveryRemediationFactory.build()
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
        ...testContext,
        actions,
        identifyResponse,
        identifyRecoveryResponse
      };
    });

    it('can proceed on demand', async () => {
      const {
        authClient,
        identifyResponse,
        identifyRecoveryResponse,
        selectAuthenticatorResponse,
        verifyEmailResponse,
        resetAuthenticatorResponse,
        successResponse
      } = testContext;
  
      chainResponses([
        identifyRecoveryResponse,
        selectAuthenticatorResponse,
        verifyEmailResponse,
        resetAuthenticatorResponse,
        successResponse
      ]);
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(identifyResponse)
        .mockResolvedValueOnce(identifyRecoveryResponse)
        .mockResolvedValueOnce(selectAuthenticatorResponse)
        .mockResolvedValueOnce(verifyEmailResponse)
        .mockResolvedValueOnce(resetAuthenticatorResponse);
  
      // First call, get recovery form
      jest.spyOn(identifyResponse.actions, 'currentAuthenticator-recover');
      let res = await recoverPassword(authClient, {});
      expect(identifyResponse.actions['currentAuthenticator-recover']).toHaveBeenCalled();
      expect(res).toMatchObject({
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
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-authenticate',
          inputs: [
            { key: 'string', name: 'authenticator' }
          ],
          options: [
            { label: 'Okta Verify', value: 'okta_verify' },
            { label: 'Phone', value: 'phone_number' },
            { label: 'Email', value: 'okta_email' }
          ]
        }
      });

      // Third call, select email authenticator
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      res = await recoverPassword(authClient, { authenticator: 'okta_email' });
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-authenticate', { 
        authenticator: { id: 'id-email' }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'challenge-authenticator',
          type: 'email',
          authenticator: {
            id: expect.any(String),
            displayName: 'Email',
            key: 'okta_email',
            methods: expect.any(Array),
            type: 'email'
          },
          inputs: [{ 
            name: 'verificationCode', 
            label: 'Enter code', 
            required: true, 
            type: 'string' 
          }]
        }
      });

      // Fourth call, submit verification code
      jest.spyOn(verifyEmailResponse, 'proceed');
      res = await recoverPassword(authClient, { verificationCode: 'fake_code' });
      expect(verifyEmailResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', { 
        credentials: { passcode: 'fake_code' }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'reset-authenticator',
          type: 'password',
          authenticator: {
            id: expect.any(String),
            displayName: 'Password',
            key: 'okta_password',
            type: 'password',
            methods: expect.any(Array),
            settings: expect.any(Object)
          },
          inputs: [{ 
            name: 'password', 
            label: 'New password',
            required: true, 
            secret: true,
            type: 'string' 
          }]
        }
      });

      // Sixth call, submit new password
      jest.spyOn(resetAuthenticatorResponse, 'proceed');
      res = await recoverPassword(authClient, { password: 'fake_password' });
      expect(resetAuthenticatorResponse.proceed).toHaveBeenCalledWith('reset-authenticator', { 
        credentials: { passcode: 'fake_password' }
      });
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalled();
    });

    it('can proceed using username and authenticator up front', async () => {
      const {
        authClient,
        identifyResponse,
        identifyRecoveryResponse,
        selectAuthenticatorResponse,
        verifyEmailResponse
      } = testContext;

      chainResponses([
        identifyRecoveryResponse,
        selectAuthenticatorResponse,
        verifyEmailResponse
      ]);
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(identifyResponse)
        .mockResolvedValueOnce(identifyRecoveryResponse)
        .mockResolvedValueOnce(selectAuthenticatorResponse);
      jest.spyOn(identifyRecoveryResponse, 'proceed');
      jest.spyOn(selectAuthenticatorResponse, 'proceed');

      const res = await recoverPassword(authClient, { username: 'myname', authenticator: 'okta_email' });
      expect(identifyRecoveryResponse.proceed).toHaveBeenCalledWith('identify-recovery', { identifier: 'myname' });
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-authenticate', { 
        authenticator: { id: 'id-email' } 
      });
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep!.name).toBe('challenge-authenticator');
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
      expect(res).toMatchObject({
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
      expect(res).toMatchObject({
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

  });

  describe('identifier first org policy', () => {
    beforeEach(() => {
      const identifyResponse = IdxResponseFactory.build({
        neededToProceed: [
          IdentifyRemediationFactory.build()
        ]
      });
  
      const selectAuthenticatorResponseWithPassword = IdxResponseFactory.build({
        neededToProceed: [
          SelectAuthenticatorAuthenticateRemediationFactory.build({
            value: [
              AuthenticatorValueFactory.build({
                options: [
                  PasswordAuthenticatorOptionFactory.build(),
                  OktaVerifyAuthenticatorOptionFactory.build(),
                  PhoneAuthenticatorOptionFactory.build(),
                  EmailAuthenticatorOptionFactory.build(),
                ]
              })
            ]
          })
        ]
      });

      const verifyPasswordResponse = IdxResponseFactory.build({
        actions: {
          'currentAuthenticatorEnrollment-recover': jest.fn().mockResolvedValue(testContext.selectAuthenticatorResponse)
        },
        neededToProceed: [
          VerifyPasswordRemediationFactory.build()
        ]
      });
  
      testContext = {
        ...testContext,
        identifyResponse,
        selectAuthenticatorResponseWithPassword,
        verifyPasswordResponse
      };
    });

    it('can proceed on demand', async () => {
      const { 
        authClient,
        identifyResponse,
        selectAuthenticatorResponseWithPassword,
        verifyPasswordResponse,
      } = testContext;

      chainResponses([
        identifyResponse,
        selectAuthenticatorResponseWithPassword,
        verifyPasswordResponse
      ]);

      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(identifyResponse)
        .mockResolvedValueOnce(identifyResponse);

      // First call, get identify form
      let res = await recoverPassword(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'identify',
          inputs: [
            { label: 'Username', name: 'username' }
          ]
        }
      });

      // Second call, submit username
      jest.spyOn(identifyResponse, 'proceed');
      jest.spyOn(selectAuthenticatorResponseWithPassword, 'proceed');
      jest.spyOn(verifyPasswordResponse.actions, 'currentAuthenticatorEnrollment-recover');
      res = await recoverPassword(authClient, { username: 'myname' });
      expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', { identifier: 'myname' });
      // Password authenticator should be selected when in recover password flow
      expect(selectAuthenticatorResponseWithPassword.proceed).toHaveBeenCalledWith('select-authenticator-authenticate', {
        authenticator: { id: 'id-password' }
      });
      // Invoke authenticator recover action
      expect(verifyPasswordResponse.actions['currentAuthenticatorEnrollment-recover']).toHaveBeenCalled();
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-authenticate',
          inputs: [
            { key: 'string', name: 'authenticator' }
          ],
          options: [
            { label: 'Okta Verify', value: 'okta_verify' },
            { label: 'Phone', value: 'phone_number' },
            { label: 'Email', value: 'okta_email' }
          ]
        }
      });

      // the rest flow is as same as the classic org policy, skip
    });

  });
   
});
