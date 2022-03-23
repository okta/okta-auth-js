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


import { unlockAccount } from '../../../lib/idx/unlockAccount';
import { IdxStatus, AuthenticatorKey } from '../../../lib/idx/types';
import { AuthSdkError } from '../../../lib/errors';

import {
  chainResponses,
  IdxResponseFactory,
  RawIdxResponseFactory,
  IdxMessagesFactory,
  IdentifyRemediationFactory,
  UnlockAccountRemediationFactory,
  SelectAuthenticatorUnlockAccountRemediationFactory,
  SelectAuthenticatorAuthenticateRemediationFactory,
  AuthenticatorValueFactory,
  UsernameValueFactory,
  VerifyEmailRemediationFactory,
  VerifyPhoneRemediationFactory,
  OktaVerifyAuthenticatorPushOnlyOptionFactory,
  PhoneAuthenticatorOptionFactory,
  EmailAuthenticatorOptionFactory,
  ChallengeAuthenticatorRemediationFactory,
  CredentialsValueFactory,
  PasscodeValueFactory,
  EmailAuthenticatorFactory,
  OktaVerifyPushChallengePollRemediationFactory
} from '@okta/test.support/idx';

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
  startTransaction: require('../../../lib/idx/startTransaction'),
  transactionMeta: require('../../../lib/idx/transactionMeta'),
  flowSpec: require('../../../lib/idx/flow/FlowSpecification'),
};

const SuccessfulTerminalState = {
  status: IdxStatus.TERMINAL,
  messages: [
    {
      'message': 'Your account is now unlocked!',
      'i18n': {
          'key': 'selfservice.unlock_user.success.message',
          'params': []
      },
      'class': 'INFO'
    }
  ]
};

describe('/idx/unlockAccout', () => {
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
        save: () => {},
        saveIdxResponse: () => {},
        loadIdxResponse: () => {}
      },
      token: {
        exchangeCodeForTokens: () => Promise.resolve(tokenResponse)
      },
      idx: {
        setFlow: () => {}
      }
    };

    jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
    jest.spyOn(mocked.transactionMeta, 'getTransactionMeta').mockReturnValue(transactionMeta);

    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({ 
      meta: transactionMeta,
      interactionHandle: transactionMeta.interactionHandle,
      state: transactionMeta.state
    });

    // introspect
    const introspectResponse = IdxResponseFactory.build({
      neededToProceed: [
        UnlockAccountRemediationFactory.build()
      ]
    });

    // unlock-account
    const unlockAccoutRemediationResponse = IdxResponseFactory.build({
      neededToProceed: [
        SelectAuthenticatorUnlockAccountRemediationFactory.build({
          value: [
            UsernameValueFactory.build(),
            AuthenticatorValueFactory.build({
              options: [
                PhoneAuthenticatorOptionFactory.build(),
                EmailAuthenticatorOptionFactory.build(),
                OktaVerifyAuthenticatorPushOnlyOptionFactory.build(),
              ]
            })
          ]
        }),
      ]
    });

    // select-authenticator-authenticate
    const selectAuthRem = SelectAuthenticatorAuthenticateRemediationFactory.build({
      value: [
        AuthenticatorValueFactory.build({
          options: [
            PhoneAuthenticatorOptionFactory.build(),
            EmailAuthenticatorOptionFactory.build(),
            OktaVerifyAuthenticatorPushOnlyOptionFactory.build(),
          ]
        })
      ]
    });

    const identifyResponse = IdxResponseFactory.build({
      neededToProceed: [
        SelectAuthenticatorAuthenticateRemediationFactory.build({
          value: [
            AuthenticatorValueFactory.build({
              options: [
                PhoneAuthenticatorOptionFactory.build(),
                EmailAuthenticatorOptionFactory.build(),
                OktaVerifyAuthenticatorPushOnlyOptionFactory.build(),
              ]
            })
          ]
        }),
      ]
    });

    const accountUnlockTerminalResponse = IdxResponseFactory.build({
      neededToProceed: [],
      rawIdxState: RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            {
              'message': 'Your account is now unlocked!',
              'i18n': {
                  'key': 'selfservice.unlock_user.success.message',
                  'params': []
              },
              'class': 'INFO'
            }
          ]
        })
      })
    });

    testContext = {
      authClient,
      transactionMeta,
      introspectResponse,
      unlockAccoutRemediationResponse,
      identifyResponse,
      accountUnlockTerminalResponse,
      selectAuthRem
    };
  });

  it('returns a transaction', async () => {
    const { 
      authClient,
      introspectResponse,
      unlockAccoutRemediationResponse
    } = testContext;

    chainResponses([
      introspectResponse,
      unlockAccoutRemediationResponse
    ]);

    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(introspectResponse)
      .mockResolvedValueOnce(unlockAccoutRemediationResponse);
    
    jest.spyOn(introspectResponse, 'proceed');
    jest.spyOn(unlockAccoutRemediationResponse, 'proceed');

    let res = await unlockAccount(authClient, {});
    expect(introspectResponse.proceed).toHaveBeenCalledWith('unlock-account', { });
    expect(res).toMatchObject({
      status: IdxStatus.PENDING,
      nextStep: {
        name: 'select-authenticator-unlock-account',
        inputs: [ // inputs are in the same order as specified in the remediation's form
          {
            label: 'Username',
            name: 'username'
          },
          {
            key: 'string',
            name: 'authenticator'
          },
        ],
        options: [
          {
            label: 'Phone',
            value: 'phone_number'
          },
          {
            label: 'Email',
            value: 'okta_email'
          },
          {
            label: 'Okta Verify',
            value: 'okta_verify'
          }
        ],
      }
    });
  });

  describe('feature detection', () => {
    beforeEach(() => {
      jest.spyOn(mocked.transactionMeta, 'hasSavedInteractionHandle').mockReturnValue(false);
    });

    it('throws an error if self service account unlock is not supported', async () => {
      const { authClient, transactionMeta } = testContext;
      // jest.spyOn(authClient.transactionManager, 'exists').mockReturnValue(false);
      authClient.token.prepareTokenParams = jest.fn().mockResolvedValue(transactionMeta);
      const identifyResponse = IdxResponseFactory.build({
        neededToProceed: [
          IdentifyRemediationFactory.build(),
          // does not contain unlock-account
        ]
      });
      jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(identifyResponse);
      let didThrow = false;
      try {
        await unlockAccount(authClient, {});
      }
      catch (err) {
        didThrow = true;
        expect(err).toBeInstanceOf(AuthSdkError);
        expect((err as any).errorSummary).toBe('Self Service Account Unlock is not supported based on your current org configuration.');
      }
      expect(didThrow).toBe(true);
    });

    it('calls startTransaction, setting flow to "unlockAccount"', async () => {
      const { authClient } = testContext;
      // jest.spyOn(authClient.transactionManager, 'exists').mockReturnValue(false);
      jest.spyOn(mocked.startTransaction, 'startTransaction').mockReturnValue({ enabledFeatures: [] });
      let didThrow = false;
      try {
        await unlockAccount(authClient, {});
      }
      catch (err) {
        didThrow = true;
        expect(err).toBeInstanceOf(AuthSdkError);
        expect((err as any).errorSummary).toBe('Self Service Account Unlock is not supported based on your current org configuration.');
      }
      expect(didThrow).toBe(true);
      expect(mocked.startTransaction.startTransaction).toHaveBeenCalledWith(authClient, { flow: 'unlockAccount', autoRemediate: false });
    });
  });

  describe('email authenticator', () => {
    beforeEach(() => {
      const selectAuthenticatorUnlockAccountResponse = IdxResponseFactory.build({
        neededToProceed: [
          VerifyEmailRemediationFactory.build(),
        ]
      });

      testContext = {
        ...testContext,
        selectAuthenticatorUnlockAccountResponse,
      };
    });

    describe('full flow', () => {
      beforeEach(() => {
        const { 
          introspectResponse,
          unlockAccoutRemediationResponse,
          selectAuthenticatorUnlockAccountResponse,
          accountUnlockTerminalResponse,
        } = testContext;
  
        chainResponses([
          introspectResponse,
          unlockAccoutRemediationResponse,
          selectAuthenticatorUnlockAccountResponse,
          accountUnlockTerminalResponse
        ]);
        
        jest.spyOn(introspectResponse, 'proceed');
        jest.spyOn(unlockAccoutRemediationResponse, 'proceed');
        jest.spyOn(selectAuthenticatorUnlockAccountResponse, 'proceed');
      });
  
      it('can proceed', async () => {
        const { 
          authClient,
          introspectResponse,
          unlockAccoutRemediationResponse,
          selectAuthenticatorUnlockAccountResponse,
        } = testContext;
  
        jest.spyOn(mocked.introspect, 'introspect')
          .mockResolvedValueOnce(introspectResponse)
          .mockResolvedValueOnce(unlockAccoutRemediationResponse)
          .mockResolvedValueOnce(selectAuthenticatorUnlockAccountResponse);
    
        let res = await unlockAccount(authClient, {});
        expect(introspectResponse.proceed).toHaveBeenCalledWith('unlock-account', {});
    
        const inputValues = {
          username: 'myname',
          authenticator: AuthenticatorKey.OKTA_EMAIL
        };
    
        res = await unlockAccount(authClient, inputValues);
        expect(unlockAccoutRemediationResponse.proceed).toHaveBeenCalledWith('select-authenticator-unlock-account', {
          identifier: 'myname',
          authenticator: {
            id: 'id-email'
          }
        });
        expect(res).toMatchObject({
          status: IdxStatus.PENDING,
          nextStep: {
            name: 'challenge-authenticator',
            type: 'email',
            inputs: [
              {
                label: 'Enter code',
                name: 'verificationCode',
                required: true,
                type: 'string'
              }
            ],
            authenticator: {
              displayName: 'Email',
              id: expect.any(String),
              key: 'okta_email',
              methods: [{ type: 'email' }],
              type: 'email'
            }
          }
        });
  
        res = await unlockAccount(authClient, { verificationCode: 'test-passcode' });
        expect(selectAuthenticatorUnlockAccountResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', {
          credentials: {
            passcode: 'test-passcode'
          }
        });
        expect(res).toMatchObject(SuccessfulTerminalState);
      });
    
      it('can auto-remediate', async () => {
        const { 
          authClient,
          introspectResponse,
          unlockAccoutRemediationResponse,
          selectAuthenticatorUnlockAccountResponse,
        } = testContext;
  
        jest.spyOn(mocked.introspect, 'introspect')
          .mockResolvedValueOnce(introspectResponse)
          // skip /introspect -> unlockAccountResponse, this is auto-remediated
          .mockResolvedValueOnce(selectAuthenticatorUnlockAccountResponse);
  
        const inputValues = {
          username: 'myname',
          authenticator: AuthenticatorKey.OKTA_EMAIL,
          verificationCode: 'test-passcode'
        };
    
        let res = await unlockAccount(authClient, inputValues);
        expect(introspectResponse.proceed).toHaveBeenCalledWith('unlock-account', {});
        expect(unlockAccoutRemediationResponse.proceed).toHaveBeenCalledWith('select-authenticator-unlock-account', {
          identifier: 'myname',
          authenticator: {
            id: 'id-email'
          }
        });
        expect(selectAuthenticatorUnlockAccountResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', {
          credentials: {
            passcode: 'test-passcode'
          }
        });
        expect(res).toMatchObject(SuccessfulTerminalState);
      });
    });

    describe('error handling', () => {
      it('can handle bad passcode', async () => {
        const { 
          authClient,
          selectAuthenticatorUnlockAccountResponse,
        } = testContext;

        const badPasscodeResponse = IdxResponseFactory.build({
          neededToProceed: [
            ChallengeAuthenticatorRemediationFactory.build({
              name: 'challenge-authenticator',
              value: [
                CredentialsValueFactory.build({
                  form: {
                    value: [
                      PasscodeValueFactory.build({
                        messages: IdxMessagesFactory.build({
                          value: [
                            {
                              'message': 'Invalid code. Try again.',
                              'i18n': {
                                'key': 'api.authn.error.PASSCODE_INVALID',
                                'params': []
                              },
                              'class': 'ERROR'
                            }
                          ]
                        })
                      })
                    ]
                  }
                })
              ],
              relatesTo: {
                value: EmailAuthenticatorFactory.build()
              }
            }),
          ]
        });
  
        jest.spyOn(mocked.introspect, 'introspect')
          .mockResolvedValueOnce(selectAuthenticatorUnlockAccountResponse)
          .mockResolvedValueOnce(badPasscodeResponse);

        jest.spyOn(selectAuthenticatorUnlockAccountResponse, 'proceed').mockResolvedValue(badPasscodeResponse);
        jest.spyOn(badPasscodeResponse, 'proceed');
  
        const inputValues = {
          username: 'myname',
          authenticator: AuthenticatorKey.OKTA_EMAIL,
          verificationCode: 'bad-passcode'
        };
    
        let res = await unlockAccount(authClient, inputValues);
        expect(selectAuthenticatorUnlockAccountResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', {
          credentials: {
            passcode: 'bad-passcode'
          }
        });
        expect(res).toMatchObject({
          status: IdxStatus.PENDING,
          messages: [
            {
              'message': 'Invalid code. Try again.',
              'i18n': {
                  'key': 'api.authn.error.PASSCODE_INVALID',
                  'params': []
              },
              'class': 'ERROR'
            }
          ]
        });
      });
    });
  });

  describe('phone authenticator', () => {
    beforeEach(() => {
      const {
        introspectResponse,
        unlockAccoutRemediationResponse,
        accountUnlockTerminalResponse,
      } = testContext;

      const selectAuthenticatorUnlockAccountResponse = IdxResponseFactory.build({
        neededToProceed: [
          VerifyPhoneRemediationFactory.build(),
        ]
      });

      testContext = {
        ...testContext,
        selectAuthenticatorUnlockAccountResponse,
      };

      chainResponses([
        introspectResponse,
        unlockAccoutRemediationResponse,
        selectAuthenticatorUnlockAccountResponse,
        accountUnlockTerminalResponse
      ]);

      jest.spyOn(introspectResponse, 'proceed');
      jest.spyOn(unlockAccoutRemediationResponse, 'proceed');
      jest.spyOn(selectAuthenticatorUnlockAccountResponse, 'proceed');
    });
  
    it('can proceed', async () => {
      const {
        authClient,
        introspectResponse,
        unlockAccoutRemediationResponse,
        selectAuthenticatorUnlockAccountResponse,
      } = testContext;

      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(introspectResponse)
        .mockResolvedValueOnce(unlockAccoutRemediationResponse)
        .mockResolvedValueOnce(selectAuthenticatorUnlockAccountResponse);
  
      let res = await unlockAccount(authClient, {});
      expect(introspectResponse.proceed).toHaveBeenCalledWith('unlock-account', {});
  
      const inputValues = {
        username: 'myname',
        authenticator: AuthenticatorKey.PHONE_NUMBER
      };
  
      res = await unlockAccount(authClient, inputValues);
      expect(unlockAccoutRemediationResponse.proceed).toHaveBeenCalledWith('select-authenticator-unlock-account', {
        identifier: 'myname',
        authenticator: {
          id: 'id-phone',
          methodType: 'sms'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'challenge-authenticator',
          type: 'phone',
          inputs: [
            {
              label: 'Enter code',
              name: 'verificationCode',
              required: true,
              type: 'string'
            }
          ],
          authenticator: {
            displayName: 'Phone',
            id: expect.any(String),
            key: 'phone_number',
            methods: [{ type: 'sms' }, { type: 'voice' }],
            type: 'phone'
          }
        }
      });

      res = await unlockAccount(authClient, { verificationCode: 'test-passcode' });
      expect(selectAuthenticatorUnlockAccountResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', {
        credentials: {
          passcode: 'test-passcode'
        }
      });
      expect(res).toMatchObject(SuccessfulTerminalState);
    });
  
    it('can auto-remediate', async () => {
      const { 
        authClient,
        introspectResponse,
        unlockAccoutRemediationResponse,
        selectAuthenticatorUnlockAccountResponse,
      } = testContext;

      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(introspectResponse)
        // skip /introspect -> unlockAccountResponse, this is auto-remediated
        .mockResolvedValueOnce(selectAuthenticatorUnlockAccountResponse);

      const inputValues = {
        username: 'myname',
        authenticator: AuthenticatorKey.PHONE_NUMBER,
        verificationCode: 'test-passcode'
      };
  
      let res = await unlockAccount(authClient, inputValues);
      expect(introspectResponse.proceed).toHaveBeenCalledWith('unlock-account', {});
      expect(unlockAccoutRemediationResponse.proceed).toHaveBeenCalledWith('select-authenticator-unlock-account', {
        identifier: 'myname',
        authenticator: {
          id: 'id-phone',
          methodType: 'sms'
        }
      });
      expect(selectAuthenticatorUnlockAccountResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', {
        credentials: {
          passcode: 'test-passcode'
        }
      });
      expect(res).toMatchObject(SuccessfulTerminalState);
    });
  });

  describe('okta verify authenticator', () => {
    beforeEach(() => {
      const {
        introspectResponse,
        unlockAccoutRemediationResponse,
        accountUnlockTerminalResponse,
      } = testContext;

      const selectAuthenticatorUnlockAccountResponse = IdxResponseFactory.build({
        neededToProceed: [
          OktaVerifyPushChallengePollRemediationFactory.build(),
        ]
      });

      testContext = {
        ...testContext,
        selectAuthenticatorUnlockAccountResponse,
      };

      chainResponses([
        introspectResponse,
        unlockAccoutRemediationResponse,
        selectAuthenticatorUnlockAccountResponse,
        accountUnlockTerminalResponse
      ]);

      jest.spyOn(introspectResponse, 'proceed');
      jest.spyOn(unlockAccoutRemediationResponse, 'proceed');
      jest.spyOn(selectAuthenticatorUnlockAccountResponse, 'proceed');
    });

    it('can proceed', async () => {
      const {
        authClient,
        introspectResponse,
        unlockAccoutRemediationResponse,
        selectAuthenticatorUnlockAccountResponse,
      } = testContext;

      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(introspectResponse)
        .mockResolvedValueOnce(unlockAccoutRemediationResponse)
        .mockResolvedValueOnce(selectAuthenticatorUnlockAccountResponse);

      let res = await unlockAccount(authClient, {});
      expect(introspectResponse.proceed).toHaveBeenCalledWith('unlock-account', {});

      const inputValues = {
        username: 'myname',
        authenticator: AuthenticatorKey.OKTA_VERIFY,
        // methodType: 'push'
      };

      res = await unlockAccount(authClient, inputValues);
      expect(unlockAccoutRemediationResponse.proceed).toHaveBeenCalledWith('select-authenticator-unlock-account', {
        identifier: 'myname',
        authenticator: {
          id: 'id-okta-verify-authenticator',
          methodType: 'push'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'challenge-poll',
          authenticator: {
            displayName: 'Okta Verify',
            id: expect.any(String),
            key: 'okta_verify',
            methods: [{ type: 'push' }],
            type: 'app'
          }
        }
      });
    });

    it('can auto-remediate', async () => {
      const {
        authClient,
        introspectResponse,
        unlockAccoutRemediationResponse,
        selectAuthenticatorUnlockAccountResponse,
      } = testContext;

      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(introspectResponse)
        // skip /introspect -> unlockAccountResponse, this is auto-remediated
        .mockResolvedValueOnce(selectAuthenticatorUnlockAccountResponse);

      const inputValues = {
        username: 'myname',
        authenticator: AuthenticatorKey.OKTA_VERIFY
      };

      let res = await unlockAccount(authClient, inputValues);
      expect(unlockAccoutRemediationResponse.proceed).toHaveBeenCalledWith('select-authenticator-unlock-account', {
        identifier: 'myname',
        authenticator: {
          id: 'id-okta-verify-authenticator',
          methodType: 'push'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'challenge-poll',
          authenticator: {
            displayName: 'Okta Verify',
            id: expect.any(String),
            key: 'okta_verify',
            methods: [{ type: 'push' }],
            type: 'app'
          }
        }
      });
    });
  });
});