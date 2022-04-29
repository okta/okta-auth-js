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


/* eslint-disable max-statements */
import { register } from '../../../lib/idx/register';
import { proceed } from '../../../lib/idx/proceed';
import { IdxStatus, AuthenticatorKey } from '../../../lib/idx/types';
import { AuthSdkError } from '../../../lib/errors';

import {
  IdxResponseFactory,
  IdentifyRemediationFactory,
  SelectEnrollProfileRemediationFactory,
  EnrollProfileRemediationFactory,
  EnrollExtendedProfileRemediationFactory,
  chainResponses,
  SelectAuthenticatorEnrollRemediationFactory,
  EnrollEmailAuthenticatorRemediationFactory,
  SkipRemediationFactory,
  RawIdxResponseFactory,
  IdxMessagesFactory,
  IdxMessageCheckYourEmailFactory,
  PhoneAuthenticatorEnrollmentDataRemediationFactory,
  EnrollPhoneAuthenticatorRemediationFactory,
  AuthenticatorValueFactory,
  PasswordAuthenticatorOptionFactory,
  PhoneAuthenticatorOptionFactory,
  EmailAuthenticatorOptionFactory,
  EnrollPasswordAuthenticatorRemediationFactory,
  IdxValueFactory,
  IdxFormFactory,
  FirstNameValueFactory,
  LastNameValueFactory,
  EmailValueFactory,
  IdxErrorInvalidLoginEmailFactory,
  IdxErrorDoesNotMatchPattern,
  IdxErrorEnrollmentInvalidPhoneFactory,
  SelectAuthenticatorAuthenticateRemediationFactory,
  EnrollGoogleAuthenticatorRemediationFactory,
  GoogleAuthenticatorOptionFactory,
  SecurityQuestionAuthenticatorOptionFactory,
  EnrollSecurityQuestionAuthenticatorRemediationFactory,
  EnrollPollRemediationFactory,
  IdxContextFactory,
  OktaVerifyAuthenticatorWithContextualDataFactory,
  SelectEnrollmentChannelRemediationFactory,
  OktaVerifyAuthenticatorOptionFactory, EnrollmentChannelDataEmailRemediationFactory, EnrollmentChannelDataSmsRemediationFactory,
  WebauthnAuthenticatorOptionFactory,
  EnrollWebauthnAuthenticatorRemediationFactory,
} from '@okta/test.support/idx';

jest.mock('../../../lib/idx/transactionMeta', () => {
  return {
    hasSavedInteractionHandle: () => true,
    getSavedTransactionMeta: () => {},
    getTransactionMeta: () => {},
    saveTransactionMeta: () => {}
  };
});

jest.mock('../../../lib/idx/introspect', () => {
  return {
    introspect: () => {}
  };
});

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
  startTransaction: require('../../../lib/idx/startTransaction'),
  transactionMeta: require('../../../lib/idx/transactionMeta')
};

describe('idx/register', () => {
 let testContext;
  beforeEach(() => {
    const issuer = 'test-issuer';
    const clientId = 'test-clientId';
    const redirectUri = 'test-redirectUri';
    const interactionCode = 'test-interactionCode';
    const transactionMeta = {
      issuer,
      clientId,
      redirectUri,
      state: 'meta-state',
      codeVerifier: 'meta-code',
      scopes: ['meta'],
      urls: { authorizeUrl: 'meta-authorizeUrl' },
      interactionHandle: 'meta-interactionHandle',
      ignoreSignature: true,
      flow: 'register',
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
        loadIdxResponse: () => {},
      },
      token: {
        exchangeCodeForTokens: () => Promise.resolve(tokenResponse)
      },
      idx: {
        setFlow: () => {}
      }
    };
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({ 
      meta: transactionMeta,
      interactionHandle: 'meta-interactionHandle',
      state: transactionMeta.state
    });
    jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
    jest.spyOn(mocked.transactionMeta, 'getTransactionMeta').mockReturnValue(transactionMeta);

    const successWithInteractionCodeResponse = IdxResponseFactory.build({
      interactionCode
    });

    const successCheckEmailResponse = IdxResponseFactory.build({
      rawIdxState: RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxMessageCheckYourEmailFactory.build()
          ]
        })
      })
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

    const enrollExtendedProfileResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollExtendedProfileRemediationFactory.build()
      ]
    });

    const selectPasswordResponse = IdxResponseFactory.build({
      neededToProceed: [
        SelectAuthenticatorEnrollRemediationFactory.build({
          value: [
            AuthenticatorValueFactory.build({
              options: [
                PasswordAuthenticatorOptionFactory.build()
              ]
            })
          ]
        })
      ]
    });

    const enrollPasswordResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollPasswordAuthenticatorRemediationFactory.build()
      ]
    });

    const selectAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        SelectAuthenticatorEnrollRemediationFactory.build({
          value: [
            AuthenticatorValueFactory.build({
              options: [
                PhoneAuthenticatorOptionFactory.build(),
                EmailAuthenticatorOptionFactory.build(),
                GoogleAuthenticatorOptionFactory.build(),
                SecurityQuestionAuthenticatorOptionFactory.build(),
                OktaVerifyAuthenticatorOptionFactory.build(),
                WebauthnAuthenticatorOptionFactory.build()
              ]
            })
          ]
        })
      ]
    });

    const enrollEmailAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollEmailAuthenticatorRemediationFactory.build()
      ]
    });

    const selectPhoneResponse = IdxResponseFactory.build({
      neededToProceed: [
        SelectAuthenticatorEnrollRemediationFactory.build({
          value: [
            AuthenticatorValueFactory.build({
              options: [
                PhoneAuthenticatorOptionFactory.build()
              ]
            })
          ]
        }),
        SkipRemediationFactory.build() // skippable
      ]
    });

    const phoneEnrollmentDataResponse = IdxResponseFactory.build({
      neededToProceed: [
        PhoneAuthenticatorEnrollmentDataRemediationFactory.build()
      ]
    });

    const enrollPhoneAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollPhoneAuthenticatorRemediationFactory.build()
      ]
    });

    const enrollGoogleAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollGoogleAuthenticatorRemediationFactory.build()
      ]
    });

    const enrollSecurityQuestionAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollSecurityQuestionAuthenticatorRemediationFactory.build()
      ]
    });

    const enrollWebauthnAuthenticatorResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollWebauthnAuthenticatorRemediationFactory.build()
      ]
    });

    testContext = {
      authClient,
      tokenResponse,
      interactionCode,
      transactionMeta,
      successWithInteractionCodeResponse,
      successCheckEmailResponse,
      identifyResponse,
      enrollProfileResponse,
      enrollExtendedProfileResponse,
      selectPasswordResponse,
      enrollPasswordResponse,
      selectAuthenticatorResponse,
      enrollEmailAuthenticatorResponse,
      selectPhoneResponse,
      phoneEnrollmentDataResponse,
      enrollPhoneAuthenticatorResponse,
      enrollGoogleAuthenticatorResponse,
      enrollSecurityQuestionAuthenticatorResponse,
      enrollWebauthnAuthenticatorResponse,
    };
  });
  
  describe('feature detection', () => {
    beforeEach(() => {
      jest.spyOn(mocked.transactionMeta, 'hasSavedInteractionHandle').mockReturnValue(false);
    });

    it('throws an error if registration is not supported', async () => {
      const { authClient, transactionMeta } = testContext;
      authClient.token.prepareTokenParams = jest.fn().mockResolvedValue(transactionMeta);
      const identifyResponse = IdxResponseFactory.build({
        neededToProceed: [
          IdentifyRemediationFactory.build(),
          // does not contain select-enroll-profile
        ]
      });
      jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(identifyResponse);
      
      let didThrow = false;
      try {
        await register(authClient, {});
      } catch (error) {
        didThrow = true;
        expect(error).toBeInstanceOf(AuthSdkError);
        expect((error as any).errorSummary).toBe('Registration is not supported based on your current org configuration.');
      }
      expect(didThrow).toBe(true);
    });
    it('calls startTransaction, setting flow to "register"', async () => {
      const { authClient } = testContext;
      jest.spyOn(mocked.startTransaction, 'startTransaction').mockReturnValue({ enabledFeatures: [] });
      let didThrow = false;
      try {
        await register(authClient, {});
      } catch (error) {
        didThrow = true;
        expect(error).toBeInstanceOf(AuthSdkError);
        expect((error as any).errorSummary).toBe('Registration is not supported based on your current org configuration.');
      }
      expect(didThrow).toBe(true);
      expect(mocked.startTransaction.startTransaction).toHaveBeenCalledWith(authClient, { flow: 'register', autoRemediate: false });
    });
    it('presence of identify remediation means activationToken is not supported', async () => {
      const { authClient, transactionMeta } = testContext;
      jest.spyOn(authClient.transactionManager, 'exists').mockReturnValue(false);
      authClient.token.prepareTokenParams = jest.fn().mockResolvedValue(transactionMeta);
      const identifyResponse = IdxResponseFactory.build({
        neededToProceed: [
          IdentifyRemediationFactory.build()
        ]
      });
      jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(identifyResponse);
            
      let didThrow = false;
      try {
        await register(authClient, { activationToken: 'fn-activationToken' });
      } catch (error) {
        didThrow = true;
        expect(error).toBeInstanceOf(AuthSdkError);
        expect((error as any).errorSummary).toBe('activationToken is not supported based on your current org configuration.');
      }
      expect(didThrow).toBe(true);
    });
    it('with activationToken should not check select-enroll-profile remediation', async () => {
      const { authClient, transactionMeta } = testContext;
      jest.spyOn(authClient.transactionManager, 'exists').mockReturnValue(false);
      authClient.token.prepareTokenParams = jest.fn().mockResolvedValue(transactionMeta);
      const identifyResponse = IdxResponseFactory.build({
        neededToProceed: [
          SelectAuthenticatorEnrollRemediationFactory.build({
            value: [
              AuthenticatorValueFactory.build({
                options: [
                  PasswordAuthenticatorOptionFactory.build()
                ]
              })
            ]
          })
        ]
      });
      jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(identifyResponse);
      const res = await register(authClient, { activationToken: 'fn-activationToken' });
      expect(res.status).toBe(IdxStatus.PENDING);
    });
  });

  describe('enroll profile', () => {
    it('can register, passing firstName, lastName, and email up front', async () => {
      const {
        authClient,
        identifyResponse,
        enrollProfileResponse,
        selectPasswordResponse,
      } = testContext;
      chainResponses([
        identifyResponse,
        enrollProfileResponse,
        selectPasswordResponse
      ]);
      jest.spyOn(identifyResponse, 'proceed');
      jest.spyOn(enrollProfileResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(identifyResponse);

      let res = await register(authClient, {
        firstName: 'Bob',
        lastName: 'Lawbla',
        email: 'boblawbla@bobslawblog.com'
      });
      expect(identifyResponse.proceed).toHaveBeenCalledWith('select-enroll-profile', { });
      expect(enrollProfileResponse.proceed).toHaveBeenCalledWith('enroll-profile', {
        userProfile: {
          email: 'boblawbla@bobslawblog.com',
          firstName: 'Bob',
          lastName: 'Lawbla'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Password',
              value: AuthenticatorKey.OKTA_PASSWORD
            }]
          }],
          options: [{
            label: 'Password',
            value: AuthenticatorKey.OKTA_PASSWORD
          }]
        },
      });
    });

    it('can register, passing firstName, lastName, email and customAttribute on demand', async () => {
      const {
        authClient,
        identifyResponse,
        enrollExtendedProfileResponse,
        selectPasswordResponse
      } = testContext;

      chainResponses([
        identifyResponse,
        enrollExtendedProfileResponse,
        selectPasswordResponse,
      ]);

      jest.spyOn(mocked.introspect, 'introspect').mockResolvedValueOnce(identifyResponse);
      jest.spyOn(identifyResponse, 'proceed');
      jest.spyOn(enrollExtendedProfileResponse, 'proceed');
      
      let res = await register(authClient, {});
      expect(identifyResponse.proceed).toHaveBeenCalledWith('select-enroll-profile', { });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-profile',
        }
      });

      const inputs = res.nextStep!.inputs!.map(({name}) => name);
      const inputValues = inputs.reduce((formData, inputName, inputIndex) => ({
        ...formData,
        [inputName]: `value${inputIndex}`
      }), {});
      jest.spyOn(mocked.introspect, 'introspect').mockResolvedValueOnce(enrollExtendedProfileResponse);
      
      res = await register(authClient, inputValues);
      expect(enrollExtendedProfileResponse.proceed).toHaveBeenCalledWith('enroll-profile', {
        userProfile: {
          email: 'value2',
          firstName: 'value0',
          lastName: 'value1',
          customAttribute: 'value3'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Password',
              value: AuthenticatorKey.OKTA_PASSWORD
            }]
          }],
          options: [{
            label: 'Password',
            value: AuthenticatorKey.OKTA_PASSWORD
          }]
        },
      });
    });
  });

  describe('password', () => {
    it('can set a password up front', async () => {
      const {
        authClient,
        selectPasswordResponse,
        enrollPasswordResponse,
        selectAuthenticatorResponse,
      } = testContext;
      
      chainResponses([
        selectPasswordResponse,
        enrollPasswordResponse,
        selectAuthenticatorResponse,
      ]);
      jest.spyOn(selectPasswordResponse, 'proceed');
      jest.spyOn(enrollPasswordResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectPasswordResponse);
  
      const password = 'my-password';
      let res = await register(authClient, {
        password,
        authenticators: [AuthenticatorKey.OKTA_PASSWORD]
      });
      expect(selectPasswordResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-password'
        }
      });
      expect(enrollPasswordResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'my-password'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }, {
              label: 'Email',
              value: AuthenticatorKey.OKTA_EMAIL
            }, {
              label: 'Google Authenticator',
              value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
            }, {
              label: 'Security Question',
              value: AuthenticatorKey.SECURITY_QUESTION
            }, {
              label: 'Okta Verify',
              value: AuthenticatorKey.OKTA_VERIFY
            }, {
              label: 'Security Key or Biometric',
              value: AuthenticatorKey.WEBAUTHN
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }, {
            label: 'Email',
            value: AuthenticatorKey.OKTA_EMAIL
          }, {
            label: 'Google Authenticator',
            value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
          }, {
            label: 'Security Question',
            value: AuthenticatorKey.SECURITY_QUESTION
          }, {
            label: 'Okta Verify',
            value: AuthenticatorKey.OKTA_VERIFY
          }, {
            label: 'Security Key or Biometric',
            value: AuthenticatorKey.WEBAUTHN
          }]
        },
      });
    });

    it('can set a password on demand', async () => {
      const {
        authClient,
        selectPasswordResponse,
        enrollPasswordResponse,
        selectAuthenticatorResponse,
      } = testContext;
      
      chainResponses([
        selectPasswordResponse,
        enrollPasswordResponse,
        selectAuthenticatorResponse,
      ]);
      jest.spyOn(selectPasswordResponse, 'proceed');
      jest.spyOn(enrollPasswordResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(selectPasswordResponse);
  
      const password = 'my-password';
      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Password',
              value: AuthenticatorKey.OKTA_PASSWORD
            }]
          }],
          options: [{
            label: 'Password',
            value: AuthenticatorKey.OKTA_PASSWORD
          }]
        },
      });
      res = await register(authClient, { password, authenticators: [AuthenticatorKey.OKTA_PASSWORD]});
      expect(selectPasswordResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-password'
        }
      });
      expect(enrollPasswordResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'my-password'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }, {
              label: 'Email',
              value: AuthenticatorKey.OKTA_EMAIL
            }, {
              label: 'Google Authenticator',
              value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
            }, {
              label: 'Security Question',
              value: AuthenticatorKey.SECURITY_QUESTION
            }, {
              label: 'Okta Verify',
              value: AuthenticatorKey.OKTA_VERIFY
            }, {
              label: 'Security Key or Biometric',
              value: AuthenticatorKey.WEBAUTHN
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }, {
            label: 'Email',
            value: AuthenticatorKey.OKTA_EMAIL
          }, {
            label: 'Google Authenticator',
            value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
          }, {
            label: 'Security Question',
            value: AuthenticatorKey.SECURITY_QUESTION
          }, {
            label: 'Okta Verify',
            value: AuthenticatorKey.OKTA_VERIFY
          }, {
            label: 'Security Key or Biometric',
            value: AuthenticatorKey.WEBAUTHN
          }]
        },
      });
    });
  });

  describe('email', () => {
    it('can set an email up front', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        enrollEmailAuthenticatorResponse,
      } = testContext;
      
      chainResponses([
        selectAuthenticatorResponse,
        enrollEmailAuthenticatorResponse
      ]);
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectAuthenticatorResponse);

      let res = await register(authClient, {
        email: 'boblawbla@bobslawblog.com',
        authenticators: [AuthenticatorKey.OKTA_EMAIL]
      });
      // Email authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-email'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'email',
          authenticator: {
            displayName: 'Email',
            id: expect.any(String),
            key: 'okta_email',
            methods: [
              {
                type: 'email',
              },
            ],
            type: 'email',
          },
          inputs: [{
            name: 'verificationCode',
            required: true,
            type: 'string',
            value: 'id-email'
          }]
        },
      });
    });

    it('can set an email on demand', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        enrollEmailAuthenticatorResponse,
      } = testContext;
      
      chainResponses([
        selectAuthenticatorResponse,
        enrollEmailAuthenticatorResponse
      ]);
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(selectAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }, {
              label: 'Email',
              value: AuthenticatorKey.OKTA_EMAIL
            }, {
              label: 'Google Authenticator',
              value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
            }, {
              label: 'Security Question',
              value: AuthenticatorKey.SECURITY_QUESTION
            }, {
              label: 'Okta Verify',
              value: AuthenticatorKey.OKTA_VERIFY
            }, {
              label: 'Security Key or Biometric',
              value: AuthenticatorKey.WEBAUTHN
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }, {
            label: 'Email',
            value: AuthenticatorKey.OKTA_EMAIL
          }, {
            label: 'Google Authenticator',
            value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
          }, {
            label: 'Security Question',
            value: AuthenticatorKey.SECURITY_QUESTION
          }, {
            label: 'Okta Verify',
            value: AuthenticatorKey.OKTA_VERIFY
          }, {
            label: 'Security Key or Biometric',
            value: AuthenticatorKey.WEBAUTHN
          }]
        },
      });

      res = await register(authClient, {
        email: 'boblawbla@bobslawblog.com',
        authenticators: [AuthenticatorKey.OKTA_EMAIL]
      });
      // Email authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-email'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'email',
          authenticator: {
            displayName: 'Email',
            id: expect.any(String),
            key: 'okta_email',
            methods: [
              {
                type: 'email',
              },
            ],
            type: 'email',
          },
          inputs: [{
            name: 'verificationCode',
            required: true,
            type: 'string',
            value: 'id-email'
          }]
        },
      });
    });

    it('can verify email using a code', async () => {
      const {
        authClient,
        enrollEmailAuthenticatorResponse,
        selectPhoneResponse,
      } = testContext;
      
      chainResponses([
        enrollEmailAuthenticatorResponse,
        selectPhoneResponse
      ]);
      jest.spyOn(enrollEmailAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(enrollEmailAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'email',
          authenticator: {
            displayName: 'Email',
            id: expect.any(String),
            key: 'okta_email',
            methods: [
              {
                type: 'email',
              },
            ],
            type: 'email',
          },
          inputs: [{
            name: 'verificationCode',
            required: true,
            type: 'string',
            value: 'id-email'
          }]
        }
      });

      // Verify email
      const verificationCode = 'test-code';
      res = await register(authClient, { verificationCode });
      expect(enrollEmailAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          canSkip: true,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }]
        },
      });
    });

    it('returns an error if value for email is not an email address', async () => {
      const {
        authClient,
        identifyResponse,
        enrollProfileResponse,
      } = testContext;
      
      const errorResponse = IdxResponseFactory.build({
        neededToProceed: [{
          name: 'enroll-profile',
          value: [
            IdxValueFactory.build({
              name: 'userProfile',
              form: IdxFormFactory.build({
                value: [
                  FirstNameValueFactory.build(),
                  LastNameValueFactory.build(),
                  EmailValueFactory.build({
                    messages: IdxMessagesFactory.build({
                      value: [
                        IdxErrorInvalidLoginEmailFactory.build(),
                        IdxErrorDoesNotMatchPattern.build()
                      ]
                    })
                  })
                ]
              })
            })
          ]
        }]
      });
      
      chainResponses([
        identifyResponse,
        enrollProfileResponse,
        errorResponse,
      ]);
      jest.spyOn(identifyResponse, 'proceed');
      jest.spyOn(enrollProfileResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(identifyResponse);

      let res = await register(authClient, {
        firstName: 'Bob',
        lastName: 'Lawbla',
        email: 'boblawbla_bobslawblog_com'
      });
      expect(identifyResponse.proceed).toHaveBeenCalledWith('select-enroll-profile', { });
      expect(enrollProfileResponse.proceed).toHaveBeenCalledWith('enroll-profile', {
        userProfile: {
          email: 'boblawbla_bobslawblog_com',
          firstName: 'Bob',
          lastName: 'Lawbla'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        messages: [{
          class: 'ERROR',
          i18n: {
            key: 'registration.error.invalidLoginEmail',
            params: ['Email']
          },
          message: '\'Email\' must be in the form of an email address'
        }, {
          class: 'ERROR',
          i18n: {
            key: 'registration.error.doesNotMatchPattern'
          },
          message: 'Provided value for property \'Email\' does not match required pattern'
        }],
        nextStep: {
          name: 'enroll-profile',
          inputs: [{
            label: 'First name',
            maxLength: 50,
            minLength: 1,
            name: 'firstName',
            required: true
          },
          {
            label: 'Last name',
            maxLength: 50,
            minLength: 1,
            name: 'lastName',
            required: true,
          },
          {
            label: 'Email',
            name: 'email',
            required: true,
            messages: expect.any(Object)
          }]
        }
      });
    });
  });

  describe('phone', () => {
    it('can set up a phone and methodType up front', async () => {
      const {
        authClient,
        tokenResponse,
        interactionCode,
        selectPhoneResponse,
        phoneEnrollmentDataResponse,
        enrollPhoneAuthenticatorResponse,
        successWithInteractionCodeResponse
      } = testContext;
      chainResponses([
        selectPhoneResponse,
        phoneEnrollmentDataResponse,
        enrollPhoneAuthenticatorResponse,
        successWithInteractionCodeResponse
      ]);

      jest.spyOn(selectPhoneResponse, 'proceed');
      jest.spyOn(phoneEnrollmentDataResponse, 'proceed');
      jest.spyOn(enrollPhoneAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectPhoneResponse)
        .mockResolvedValueOnce(enrollPhoneAuthenticatorResponse);

      jest.spyOn(authClient.token, 'exchangeCodeForTokens');

      const verificationCode = 'test-code';

      // Enroll in phone authenticator
      let res = await register(authClient, { 
        authenticators: [{
          key: AuthenticatorKey.PHONE_NUMBER,
          methodType: 'sms',
          phoneNumber: '(555) 555-5555'
        }]
      });
      expect(selectPhoneResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-phone'
        }
      });
      expect(phoneEnrollmentDataResponse.proceed).toHaveBeenCalledWith('authenticator-enrollment-data', {
        authenticator: {
          id: 'id-phone',
          methodType: 'sms',
          phoneNumber: '(555) 555-5555'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: expect.any(String),
            key: 'phone_number',
            methods: [
              { type: 'sms' },
              { type: 'voice' }
            ],
            type: 'phone',
          },
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        },
      });

      res = await register(authClient, { verificationCode });
      expect(enrollPhoneAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.SUCCESS,
        tokens: tokenResponse.tokens,
      });
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        clientId: 'test-clientId',
        codeVerifier: 'meta-code',
        ignoreSignature: true,
        interactionCode,
        redirectUri: 'test-redirectUri',
        scopes: ['meta']
      }, {
        authorizeUrl: 'meta-authorizeUrl'
      });
    });

    it('can set up a phone on demand', async () => {
      const {
        authClient,
        tokenResponse,
        interactionCode,
        selectPhoneResponse,
        phoneEnrollmentDataResponse,
        enrollPhoneAuthenticatorResponse,
        successWithInteractionCodeResponse
      } = testContext;
      chainResponses([
        selectPhoneResponse,
        phoneEnrollmentDataResponse,
        enrollPhoneAuthenticatorResponse,
        successWithInteractionCodeResponse
      ]);

      jest.spyOn(selectPhoneResponse, 'proceed');
      jest.spyOn(phoneEnrollmentDataResponse, 'proceed');
      jest.spyOn(enrollPhoneAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectPhoneResponse)
        .mockResolvedValueOnce(phoneEnrollmentDataResponse)
        .mockResolvedValueOnce(enrollPhoneAuthenticatorResponse);

      jest.spyOn(authClient.token, 'exchangeCodeForTokens');

      const verificationCode = 'test-code';

      let res = await register(authClient, { authenticator: AuthenticatorKey.PHONE_NUMBER });
      expect(selectPhoneResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-phone'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'authenticator-enrollment-data',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: expect.any(String),
            key: 'phone_number',
            methods: [
              { type: 'sms' },
              { type: 'voice' }
            ],
            type: 'phone',
          },
          inputs: [
            { 
              name: 'methodType', 
              type: 'string', 
              required: true,
              options: [
                { label: 'SMS', value: 'sms' },
                { label: 'Voice call', value: 'voice' },
              ]
            },
            { name: 'phoneNumber', type: 'string', required: true, label: 'Phone Number' },
          ],
          options: [
            { label: 'SMS', value: 'sms' },
            { label: 'Voice call', value: 'voice' },
          ]
        },
      });

      res = await register(authClient, { 
        phoneNumber: '(555) 555-5555', 
        methodType: 'sms' 
      });
      expect(phoneEnrollmentDataResponse.proceed)
        .toHaveBeenCalledWith('authenticator-enrollment-data', {
          authenticator: {
            id: 'id-phone',
            methodType: 'sms',
            phoneNumber: '(555) 555-5555'
          }
        });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: expect.any(String),
            key: 'phone_number',
            methods: [
              { type: 'sms' },
              { type: 'voice' }
            ],
            type: 'phone',
          },
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        },
      });

      res = await register(authClient, { verificationCode });
      expect(enrollPhoneAuthenticatorResponse.proceed)
        .toHaveBeenCalledWith('enroll-authenticator', {
          credentials: {
            passcode: 'test-code'
          }
        });
      expect(res).toMatchObject({
        status: IdxStatus.SUCCESS,
        tokens: tokenResponse.tokens,
      });
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        clientId: 'test-clientId',
        codeVerifier: 'meta-code',
        ignoreSignature: true,
        interactionCode,
        redirectUri: 'test-redirectUri',
        scopes: ['meta']
      }, {
        authorizeUrl: 'meta-authorizeUrl'
      });
    });

    it('can verify phone using a code', async () => {
      const {
        authClient,
        tokenResponse,
        interactionCode,
        enrollPhoneAuthenticatorResponse,
        successWithInteractionCodeResponse
      } = testContext;
      chainResponses([
        enrollPhoneAuthenticatorResponse,
        successWithInteractionCodeResponse
      ]);

      jest.spyOn(enrollPhoneAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(enrollPhoneAuthenticatorResponse);

      jest.spyOn(authClient.token, 'exchangeCodeForTokens');

      const verificationCode = 'test-code';

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: expect.any(String),
            key: 'phone_number',
            methods: [
              { type: 'sms' },
              { type: 'voice' }
            ],
            type: 'phone',
          },
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        },
      });

      res = await register(authClient, { verificationCode });
      expect(enrollPhoneAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toMatchObject({
        'status': IdxStatus.SUCCESS,
        'tokens': tokenResponse.tokens,
      });
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        clientId: 'test-clientId',
        codeVerifier: 'meta-code',
        ignoreSignature: true,
        interactionCode,
        redirectUri: 'test-redirectUri',
        scopes: ['meta']
      }, {
        authorizeUrl: 'meta-authorizeUrl'
      });
    });

    it('returns a PENDING error if an invalid phone number was entered', async () => {
      const {
        authClient,
        phoneEnrollmentDataResponse,
      } = testContext;

      const errorResponse = IdxResponseFactory.build({
        requestDidSucceed: false,
        rawIdxState: RawIdxResponseFactory.build({
          messages: IdxMessagesFactory.build({
            value: [
              IdxErrorEnrollmentInvalidPhoneFactory.build()
            ]
          })
        }),
        neededToProceed: [
          SelectAuthenticatorAuthenticateRemediationFactory.build({
            value: [
              AuthenticatorValueFactory.build({
                options: [
                  PhoneAuthenticatorOptionFactory.build(),
                ]
              })
            ]
          })
        ]
      });

      jest.spyOn(phoneEnrollmentDataResponse, 'proceed').mockResolvedValue(errorResponse);
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(phoneEnrollmentDataResponse);

      const phoneNumber = 'obviously-not-valid';
      let res = await register(authClient, { authenticators: [{
          key: AuthenticatorKey.PHONE_NUMBER,
          methodType: 'sms',
          phoneNumber
        }] 
      });
      expect(phoneEnrollmentDataResponse.proceed).toHaveBeenCalledWith('authenticator-enrollment-data', {
        authenticator: {
          id: 'id-phone',
          methodType: 'sms',
          phoneNumber
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        messages: [{
          class: 'ERROR',
          i18n: {
            key: undefined // this error does not have an i18n key
          },
          message: 'Invalid Phone Number.'
        }],
        nextStep: {
          name: 'authenticator-enrollment-data',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: expect.any(String),
            key: 'phone_number',
            methods: [
              { type: 'sms' },
              { type: 'voice' }
            ],
            type: 'phone',
          },
          inputs: [
            { 
              name: 'methodType', 
              type: 'string', 
              required: true,
              options: [
                { label: 'SMS', value: 'sms' },
                { label: 'Voice call', value: 'voice' },
              ]
            },
            { name: 'phoneNumber', type: 'string', required: true, label: 'Phone Number' }
          ],
          options: [
            { label: 'SMS', value: 'sms' },
            { label: 'Voice call', value: 'voice' },
          ]
        }
      });

    });
  });

  describe('google authenticator', () => {
    it('can set an google authenticator up front', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        enrollGoogleAuthenticatorResponse,
      } = testContext;
      
      chainResponses([
        selectAuthenticatorResponse,
        enrollGoogleAuthenticatorResponse
      ]);
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectAuthenticatorResponse);

      let res = await register(authClient, {
        authenticator: AuthenticatorKey.GOOGLE_AUTHENTICATOR
      });
      // Google authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-google-authenticator'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'app',
          authenticator: {
            displayName: 'Google Authenticator',
            id: expect.any(String),
            key: 'google_otp',
            methods: [
              { type: 'otp' }
            ],
            type: 'app',
            contextualData: {
              qrcode: {
                href: 'data:image/png;base64,fake_encoding==',
                method: 'embedded',
                type: 'image/png',
              },
              sharedSecret: 'fake_secret',
            }
          },
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        }
      });
    });

    it('can set an google authenticator on demand', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        enrollGoogleAuthenticatorResponse,
      } = testContext;
      
      chainResponses([
        selectAuthenticatorResponse,
        enrollGoogleAuthenticatorResponse
      ]);
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(selectAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }, {
              label: 'Email',
              value: AuthenticatorKey.OKTA_EMAIL
            }, {
              label: 'Google Authenticator',
              value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
            }, {
              label: 'Security Question',
              value: AuthenticatorKey.SECURITY_QUESTION
            }, {
              label: 'Okta Verify',
              value: AuthenticatorKey.OKTA_VERIFY
            }, {
              label: 'Security Key or Biometric',
              value: AuthenticatorKey.WEBAUTHN
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }, {
            label: 'Email',
            value: AuthenticatorKey.OKTA_EMAIL
          }, {
            label: 'Google Authenticator',
            value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
          }, {
            label: 'Security Question',
            value: AuthenticatorKey.SECURITY_QUESTION
          }, {
            label: 'Okta Verify',
            value: AuthenticatorKey.OKTA_VERIFY
          }, {
            label: 'Security Key or Biometric',
            value: AuthenticatorKey.WEBAUTHN
          }]
        }
      });

      res = await register(authClient, {
        authenticators: [AuthenticatorKey.GOOGLE_AUTHENTICATOR]
      });
      // Email authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-google-authenticator'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'app',
          authenticator: {
            displayName: 'Google Authenticator',
            id: expect.any(String),
            key: 'google_otp',
            methods: [
              { type: 'otp' }
            ],
            type: 'app',
            contextualData: {
              qrcode: {
                href: 'data:image/png;base64,fake_encoding==',
                method: 'embedded',
                type: 'image/png',
              },
              sharedSecret: 'fake_secret',
            }
          },
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        }
      });
    });

    it('can verify google authenticator using a code', async () => {
      const {
        authClient,
        enrollGoogleAuthenticatorResponse,
        selectPhoneResponse,
      } = testContext;
      
      chainResponses([
        enrollGoogleAuthenticatorResponse,
        selectPhoneResponse
      ]);
      jest.spyOn(enrollGoogleAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(enrollGoogleAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'app',
          authenticator: {
            displayName: 'Google Authenticator',
            id: expect.any(String),
            key: 'google_otp',
            methods: [
              { type: 'otp' }
            ],
            type: 'app',
            contextualData: {
              qrcode: {
                href: 'data:image/png;base64,fake_encoding==',
                method: 'embedded',
                type: 'image/png',
              },
              sharedSecret: 'fake_secret',
            }
          },
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        }
      });

      // Verify email
      const verificationCode = 'test-code';
      res = await register(authClient, { verificationCode });
      expect(enrollGoogleAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          canSkip: true,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }]
        }
      });
    });

  });

  describe('security question authenticator', () => {
    it('can set an security question authenticator up front', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        enrollSecurityQuestionAuthenticatorResponse
      } = testContext;
      
      chainResponses([
        selectAuthenticatorResponse,
        enrollSecurityQuestionAuthenticatorResponse
      ]);
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectAuthenticatorResponse);

      let res = await register(authClient, {
        authenticator: AuthenticatorKey.SECURITY_QUESTION
      });
      // Google authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-security-question-authenticator'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'security_question',
          authenticator: {
            displayName: 'Security Question',
            id: expect.any(String),
            key: 'security_question',
            methods: [
              { type: 'security_question' }
            ],
            type: 'security_question',
            contextualData: {
              questions: [
                {
                  questionKey: 'disliked_food', 
                  question: 'What is the food you least liked as a child?'
                },
                {
                  questionKey: 'name_of_first_plush_toy', 
                  question: 'What is the name of your first stuffed animal?'
                },
                {
                  questionKey: 'first_award', 
                  question: 'What did you earn your first medal or award for?'
                }
              ],
              questionKeys: [
                'disliked_food',
                'name_of_first_plush_toy',
                'first_award'
              ]
            }
          },
          inputs: [
            { name: 'questionKey', type: 'string', required: true },
            { name: 'question', type: 'string', label: 'Create a security question' },
            { name: 'answer', type: 'string', label: 'Answer', required: true },
          ]
        }
      });
    });

    it('can set an google authenticator on demand', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        enrollSecurityQuestionAuthenticatorResponse,
      } = testContext;
      
      chainResponses([
        selectAuthenticatorResponse,
        enrollSecurityQuestionAuthenticatorResponse
      ]);
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(selectAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }, {
              label: 'Email',
              value: AuthenticatorKey.OKTA_EMAIL
            }, {
              label: 'Google Authenticator',
              value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
            }, {
              label: 'Security Question',
              value: AuthenticatorKey.SECURITY_QUESTION
            }, {
              label: 'Okta Verify',
              value: AuthenticatorKey.OKTA_VERIFY
            }, {
              label: 'Security Key or Biometric',
              value: AuthenticatorKey.WEBAUTHN
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }, {
            label: 'Email',
            value: AuthenticatorKey.OKTA_EMAIL
          }, {
            label: 'Google Authenticator',
            value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
          }, {
            label: 'Security Question',
            value: AuthenticatorKey.SECURITY_QUESTION
          }, {
            label: 'Okta Verify',
            value: AuthenticatorKey.OKTA_VERIFY
          }, {
            label: 'Security Key or Biometric',
            value: AuthenticatorKey.WEBAUTHN
          }]
        }
      });

      res = await register(authClient, {
        authenticators: [AuthenticatorKey.SECURITY_QUESTION]
      });
      // Email authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-security-question-authenticator'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'security_question',
          authenticator: {
            displayName: 'Security Question',
            id: expect.any(String),
            key: 'security_question',
            methods: [
              { type: 'security_question' }
            ],
            type: 'security_question',
            contextualData: {
              questions: [
                {
                  questionKey: 'disliked_food', 
                  question: 'What is the food you least liked as a child?'
                },
                {
                  questionKey: 'name_of_first_plush_toy', 
                  question: 'What is the name of your first stuffed animal?'
                },
                {
                  questionKey: 'first_award', 
                  question: 'What did you earn your first medal or award for?'
                }
              ],
              questionKeys: [
                'disliked_food',
                'name_of_first_plush_toy',
                'first_award'
              ]
            }
          },
          inputs: [
            { name: 'questionKey', type: 'string', required: true },
            { name: 'question', type: 'string', label: 'Create a security question' },
            { name: 'answer', type: 'string', label: 'Answer', required: true },
          ]
        }
      });
    });

    it('can enroll by choosing a question and with the answer', async () => {
      const {
        authClient,
        enrollSecurityQuestionAuthenticatorResponse,
        selectPhoneResponse,
      } = testContext;
      
      chainResponses([
        enrollSecurityQuestionAuthenticatorResponse,
        selectPhoneResponse
      ]);
      jest.spyOn(enrollSecurityQuestionAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(enrollSecurityQuestionAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'security_question',
          authenticator: {
            displayName: 'Security Question',
            id: expect.any(String),
            key: 'security_question',
            methods: [
              { type: 'security_question' }
            ],
            type: 'security_question',
            contextualData: {
              questions: [
                {
                  questionKey: 'disliked_food', 
                  question: 'What is the food you least liked as a child?'
                },
                {
                  questionKey: 'name_of_first_plush_toy', 
                  question: 'What is the name of your first stuffed animal?'
                },
                {
                  questionKey: 'first_award', 
                  question: 'What did you earn your first medal or award for?'
                }
              ],
              questionKeys: [
                'disliked_food',
                'name_of_first_plush_toy',
                'first_award'
              ]
            }
          },
          inputs: [
            { name: 'questionKey', type: 'string', required: true },
            { name: 'question', type: 'string', label: 'Create a security question' },
            { name: 'answer', type: 'string', label: 'Answer', required: true },
          ]
        }
      });

      const answer = 'test-answer';
      res = await register(authClient, { questionKey: 'test-key', answer });
      expect(enrollSecurityQuestionAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          questionKey: 'test-key',
          answer: 'test-answer'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          canSkip: true,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }]
        }
      });
    });

    it('can enroll by creating own question and with the answer', async () => {
      const {
        authClient,
        enrollSecurityQuestionAuthenticatorResponse,
        selectPhoneResponse,
      } = testContext;
      
      chainResponses([
        enrollSecurityQuestionAuthenticatorResponse,
        selectPhoneResponse
      ]);
      jest.spyOn(enrollSecurityQuestionAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(enrollSecurityQuestionAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'security_question',
          authenticator: {
            displayName: 'Security Question',
            id: expect.any(String),
            key: 'security_question',
            methods: [
              { type: 'security_question' }
            ],
            type: 'security_question',
            contextualData: {
              questions: [
                {
                  questionKey: 'disliked_food', 
                  question: 'What is the food you least liked as a child?'
                },
                {
                  questionKey: 'name_of_first_plush_toy', 
                  question: 'What is the name of your first stuffed animal?'
                },
                {
                  questionKey: 'first_award', 
                  question: 'What did you earn your first medal or award for?'
                }
              ],
              questionKeys: [
                'disliked_food',
                'name_of_first_plush_toy',
                'first_award'
              ]
            }
          },
          inputs: [
            { name: 'questionKey', type: 'string', required: true },
            { name: 'question', type: 'string', label: 'Create a security question' },
            { name: 'answer', type: 'string', label: 'Answer', required: true },
          ]
        }
      });

      const answer = 'test-answer';
      res = await register(authClient, { question: 'test-question', answer });
      expect(enrollSecurityQuestionAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          questionKey: 'custom',
          question: 'test-question',
          answer: 'test-answer'
        }
      });
      expect(res).toMatchObject({
        status: IdxStatus.PENDING,
        nextStep: {
          canSkip: true,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            type: 'string',
            options: [{
              label: 'Phone',
              value: AuthenticatorKey.PHONE_NUMBER
            }]
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }]
        }
      });
    });

  });

  describe('Okta Verify Authenticator', () => {
    const enrollPollResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollPollRemediationFactory.build(),
        SelectEnrollmentChannelRemediationFactory.build(),
      ],
      context: IdxContextFactory.build({
        currentAuthenticator: {
          value: OktaVerifyAuthenticatorWithContextualDataFactory.build()
        }
      }),
    });

    const enrollmentChannelDataEmailResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollmentChannelDataEmailRemediationFactory.build()
      ],
      context: IdxContextFactory.build({
        currentAuthenticator: {
          value: OktaVerifyAuthenticatorWithContextualDataFactory.build()
        }
      }),
    });

    const enrollmentChannelDataSmsResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollmentChannelDataSmsRemediationFactory.build()
      ],
      context: IdxContextFactory.build({
        currentAuthenticator: {
          value: OktaVerifyAuthenticatorWithContextualDataFactory.build()
        }
      }),
    });

    it('is available for selection', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
      } = testContext;

      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(selectAuthenticatorResponse);

      let response = await register(authClient, {});
      expect(selectAuthenticatorResponse.proceed).not.toHaveBeenCalled();
      expect(response.nextStep?.options).toContainEqual({
        label: 'Okta Verify',
        value: AuthenticatorKey.OKTA_VERIFY
      });
    });

    it('prompts to start polling when selected', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
      } = testContext;

      chainResponses([
        selectAuthenticatorResponse,
        enrollPollResponse,
      ]);

      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(enrollPollResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectAuthenticatorResponse)
        .mockResolvedValueOnce(enrollPollResponse);

      let response = await register(authClient, {
        authenticator: AuthenticatorKey.OKTA_VERIFY
      });
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalled();
      expect(enrollPollResponse.proceed).not.toHaveBeenCalled();
      expect(Object.keys(response.nextStep as object)).toContain('poll');
    });

    it('offers QR code as a default channel for adding OV account', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
      } = testContext;

      chainResponses([
        selectAuthenticatorResponse,
        enrollPollResponse,
      ]);

      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectAuthenticatorResponse);

      const { nextStep } = await register(authClient, {
        authenticator: AuthenticatorKey.OKTA_VERIFY
      });
      const { authenticator } = nextStep!;
      const { contextualData } = authenticator!;
      expect(Object.keys(contextualData as object)).toContain('qrcode');
    });

    it('can enroll via SMS link', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        successWithInteractionCodeResponse
      } = testContext;

      chainResponses([
        selectAuthenticatorResponse,
        enrollPollResponse,
        enrollmentChannelDataSmsResponse,
        successWithInteractionCodeResponse
      ]);

      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectAuthenticatorResponse)
        .mockResolvedValueOnce(enrollPollResponse)
        .mockResolvedValueOnce(enrollPollResponse) // submit enrollment channel
        .mockResolvedValueOnce(enrollmentChannelDataSmsResponse);

      jest.spyOn(enrollPollResponse, 'proceed');
      jest.spyOn(enrollmentChannelDataSmsResponse, 'proceed');

      await register(authClient, {
        authenticator: AuthenticatorKey.OKTA_VERIFY
      });
      let res = await proceed(authClient, {
        step: 'select-enrollment-channel'
      });
      const { options } = res.nextStep!;
      expect(options).toContainEqual({
        label: 'SMS',
        value: 'sms'
      });

      res = await proceed(authClient, {
        channel: 'phoneNumber'
      });
      const { inputs } = res.nextStep!;

      expect(enrollPollResponse.proceed).toHaveBeenCalledWith(
        'select-enrollment-channel',
        expect.objectContaining({ authenticator: expect.objectContaining({ channel: 'phoneNumber' }) })
      );

      expect(inputs).toContainEqual({
        name: 'phoneNumber',
        label: 'Phone Number',
        required: true,
        type: 'string',
      });

      await proceed(authClient, {
        phoneNumber: '+1234'
      });

      expect(enrollmentChannelDataSmsResponse.proceed).toHaveBeenCalled();
    });

    it('can enroll via email link', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        successWithInteractionCodeResponse
      } = testContext;

      chainResponses([
        selectAuthenticatorResponse,
        enrollPollResponse,
        enrollmentChannelDataEmailResponse,
        successWithInteractionCodeResponse
      ]);

      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectAuthenticatorResponse)
        .mockResolvedValueOnce(enrollPollResponse)
        .mockResolvedValueOnce(enrollPollResponse) // submit enrollment channel
        .mockResolvedValueOnce(enrollmentChannelDataEmailResponse);

      jest.spyOn(enrollPollResponse, 'proceed');
      jest.spyOn(enrollmentChannelDataEmailResponse, 'proceed');

      await register(authClient, {
        authenticator: AuthenticatorKey.OKTA_VERIFY
      });
      let res = await proceed(authClient, {
        step: 'select-enrollment-channel'
      });
      const { options } = res.nextStep!;

      expect(options).toContainEqual({
        label: 'EMAIL',
        value: 'email'
      });

      res = await proceed(authClient, {
        channel: 'email'
      });
      const { inputs }  = res.nextStep!;

      expect(enrollPollResponse.proceed).toHaveBeenCalledWith(
        'select-enrollment-channel',
        expect.objectContaining({ authenticator: expect.objectContaining({ channel: 'email' }) })
      );

      expect(inputs).toContainEqual({
        name: 'email',
        label: 'Email',
        required: true,
        type: 'string',
      });

      await proceed(authClient, {
        email: 'noreply@devnull.org'
      });

      expect(enrollmentChannelDataEmailResponse.proceed).toHaveBeenCalled();
    });
  });

  describe('webauthn', () => {
    it('can set an webauthn authenticator up front', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        enrollWebauthnAuthenticatorResponse
      } = testContext;
      
      chainResponses([
        selectAuthenticatorResponse,
        enrollWebauthnAuthenticatorResponse
      ]);
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectAuthenticatorResponse);

      let res = await register(authClient, {
        authenticator: AuthenticatorKey.WEBAUTHN
      });
      // Webauthn authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-webauthn-authenticator'
        }
      });
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        name: 'enroll-authenticator',
        type: 'security_key',
        authenticator: {
          displayName: 'Security Key or Biometric',
          id: expect.any(String),
          key: 'webauthn',
          methods: [
            { type: 'webauthn' }
          ],
          type: 'security_key',
          contextualData: {
            activationData: {
              rp: {
                name: 'Javascript IDX SDK Test Org'
              },
              user: {
                id: '000000001',
                name: 'mary@acme.com',
                displayName: 'Mary'
              },
              pubKeyCredParams: [{
                type: 'public-key',
                alg: -7
              }, {
                type: 'public-key',
                alg: -257
              }],
              challenge: 'CHALLENGE',
              attestation: 'direct',
              authenticatorSelection: {
                userVerification: 'discouraged',
                requireResidentKey: false,
              }
            }
          }
        },
        inputs: [
          { name: 'clientData', type: 'string', required: true, visible: false, label: 'Client Data' },
          { name: 'attestation', type: 'string', required: true, visible: false, label: 'Attestation' },
        ]
      });
    });

    it('can set an webauthn authenticator on demand', async () => {
      const {
        authClient,
        selectAuthenticatorResponse,
        enrollWebauthnAuthenticatorResponse,
      } = testContext;
      
      chainResponses([
        selectAuthenticatorResponse,
        enrollWebauthnAuthenticatorResponse
      ]);
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(selectAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        name: 'select-authenticator-enroll',
        inputs: [{
          name: 'authenticator',
          type: 'string',
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }, {
            label: 'Email',
            value: AuthenticatorKey.OKTA_EMAIL
          }, {
            label: 'Google Authenticator',
            value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
          }, {
            label: 'Security Question',
            value: AuthenticatorKey.SECURITY_QUESTION
          }, {
            label: 'Okta Verify',
            value: AuthenticatorKey.OKTA_VERIFY
          }, {
            label: 'Security Key or Biometric',
            value: AuthenticatorKey.WEBAUTHN
          }]
        }],
        options: [{
          label: 'Phone',
          value: AuthenticatorKey.PHONE_NUMBER
        }, {
          label: 'Email',
          value: AuthenticatorKey.OKTA_EMAIL
        }, {
          label: 'Google Authenticator',
          value: AuthenticatorKey.GOOGLE_AUTHENTICATOR
        }, {
          label: 'Security Question',
          value: AuthenticatorKey.SECURITY_QUESTION
        }, {
          label: 'Okta Verify',
          value: AuthenticatorKey.OKTA_VERIFY
        }, {
          label: 'Security Key or Biometric',
          value: AuthenticatorKey.WEBAUTHN
        }]
      });

      res = await register(authClient, {
        authenticators: [AuthenticatorKey.WEBAUTHN]
      });
      // Webauthn authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-webauthn-authenticator'
        }
      });
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        name: 'enroll-authenticator',
        type: 'security_key',
        authenticator: {
          displayName: 'Security Key or Biometric',
          id: expect.any(String),
          key: 'webauthn',
          methods: [
            { type: 'webauthn' }
          ],
          type: 'security_key',
          contextualData: {
            activationData: {
              rp: {
                name: 'Javascript IDX SDK Test Org'
              },
              user: {
                id: '000000001',
                name: 'mary@acme.com',
                displayName: 'Mary'
              },
              pubKeyCredParams: [{
                type: 'public-key',
                alg: -7
              }, {
                type: 'public-key',
                alg: -257
              }],
              challenge: 'CHALLENGE',
              attestation: 'direct',
              authenticatorSelection: {
                userVerification: 'discouraged',
                requireResidentKey: false,
              }
            }
          }
        },
        inputs: [
          { name: 'clientData', type: 'string', required: true, visible: false, label: 'Client Data' },
          { name: 'attestation', type: 'string', required: true, visible: false, label: 'Attestation' },
        ]
      });
    });

    it('can enroll with clientData and attestation', async () => {
      const {
        authClient,
        enrollWebauthnAuthenticatorResponse,
        selectPhoneResponse,
      } = testContext;

      chainResponses([
        enrollWebauthnAuthenticatorResponse,
        selectPhoneResponse
      ]);
      jest.spyOn(enrollWebauthnAuthenticatorResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValue(enrollWebauthnAuthenticatorResponse);

      let res = await register(authClient, {});
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        name: 'enroll-authenticator',
        type: 'security_key',
        authenticator: {
          displayName: 'Security Key or Biometric',
          id: expect.any(String),
          key: 'webauthn',
          methods: [
            { type: 'webauthn' }
          ],
          type: 'security_key',
          contextualData: {
            activationData: {
              rp: {
                name: 'Javascript IDX SDK Test Org'
              },
              user: {
                id: '000000001',
                name: 'mary@acme.com',
                displayName: 'Mary'
              },
              pubKeyCredParams: [{
                type: 'public-key',
                alg: -7
              }, {
                type: 'public-key',
                alg: -257
              }],
              challenge: 'CHALLENGE',
              attestation: 'direct',
              authenticatorSelection: {
                userVerification: 'discouraged',
                requireResidentKey: false,
              }
            }
          }
        },
        inputs: [
          { name: 'clientData', type: 'string', required: true, visible: false, label: 'Client Data' },
          { name: 'attestation', type: 'string', required: true, visible: false, label: 'Attestation' },
        ]
      });

      res = await register(authClient, { clientData: 'CLIENT-DATA', attestation: 'ATTESTATION' });
      expect(enrollWebauthnAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          clientData: 'CLIENT-DATA',
          attestation: 'ATTESTATION'
        }
      });
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        canSkip: true,
        name: 'select-authenticator-enroll',
        inputs: [{
          name: 'authenticator',
          type: 'string',
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }]
        }],
        options: [{
          label: 'Phone',
          value: AuthenticatorKey.PHONE_NUMBER
        }]
      });
    });
  });

  describe('skip', () => {
    it('can skip enrolling in optional authenticators', async () => {
      const {
        authClient,
        tokenResponse,
        interactionCode,
        selectPhoneResponse,
        successWithInteractionCodeResponse
      } = testContext;
      
      chainResponses([
        selectPhoneResponse,
        successWithInteractionCodeResponse
      ]);
      jest.spyOn(selectPhoneResponse, 'proceed');
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(selectPhoneResponse)
        .mockResolvedValueOnce(selectPhoneResponse);
      jest.spyOn(authClient.token, 'exchangeCodeForTokens');

      let res = await register(authClient, {});
      expect(res).toMatchObject({
        nextStep: {
          inputs: [
            {
              name: 'authenticator',
              type: 'string',
              options: [
                { 
                  label: 'Phone', 
                  value: AuthenticatorKey.PHONE_NUMBER 
                }
              ],
            },
          ],
          name: 'select-authenticator-enroll',
          options: [
            { 
              label: 'Phone', 
              value: AuthenticatorKey.PHONE_NUMBER 
            }
          ],
          canSkip: true,
        },
        status: IdxStatus.PENDING,
      });
      res = await register(authClient, { skip: true });
      expect(selectPhoneResponse.proceed).toHaveBeenCalledWith('skip', {});
      expect(res).toMatchObject({
        status: IdxStatus.SUCCESS,
        tokens: tokenResponse.tokens,
      });
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        clientId: 'test-clientId',
        codeVerifier: 'meta-code',
        ignoreSignature: true,
        interactionCode,
        redirectUri: 'test-redirectUri',
        scopes: ['meta']
      }, {
        authorizeUrl: 'meta-authorizeUrl'
      });
    });
  });

});