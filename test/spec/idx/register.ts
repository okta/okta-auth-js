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
  GoogleAuthenticatorOptionFactory
} from '@okta/test.support/idx';

jest.mock('../../../lib/idx/introspect', () => {
  return {
    introspect: () => {}
  };
});

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
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
      }
    };
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({ 
      meta: transactionMeta,
      interactionHandle: 'meta-interactionHandle',
      state: transactionMeta.state
    });

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
                GoogleAuthenticatorOptionFactory.build()
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
      enrollGoogleAuthenticatorResponse
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
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(identifyResponse);
    const res = await register(authClient, {});
    expect(res.status).toBe(IdxStatus.FAILURE);
    expect(res.error).toBeInstanceOf(AuthSdkError);
    expect(res.error.errorSummary).toBe('Registration is not supported based on your current org configuration.');
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
          }],
          options: [{
            label: 'Password',
            value: AuthenticatorKey.OKTA_PASSWORD
          }]
        }
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
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-profile',
        }
      });

      const inputs = res.nextStep.inputs.map(({name}) => name);
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
          }],
          options: [{
            label: 'Password',
            value: AuthenticatorKey.OKTA_PASSWORD
          }]
        }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
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
          }]
        }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
          }],
          options: [{
            label: 'Password',
            value: AuthenticatorKey.OKTA_PASSWORD
          }]
        }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
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
          }]
        }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'email',
          authenticator: {
            displayName: 'Email',
            id: '11',
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
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
          }]
        }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'email',
          authenticator: {
            displayName: 'Email',
            id: '11',
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'email',
          authenticator: {
            displayName: 'Email',
            id: '11',
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          canSkip: true,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }]
        }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: '12',
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
        }
      });

      res = await register(authClient, { verificationCode });
      expect(enrollPhoneAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'authenticator-enrollment-data',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: '9',
            key: 'phone_number',
            methods: [
              { type: 'sms' },
              { type: 'voice' }
            ],
            type: 'phone',
          },
          inputs: [
            { name: 'methodType', type: 'string', required: true },
            { name: 'phoneNumber', type: 'string', required: true },
          ],
          options: [
            { label: 'SMS', value: 'sms' },
            { label: 'Voice call', value: 'voice' },
          ]
        }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: '12',
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
        }
      });

      res = await register(authClient, { verificationCode });
      expect(enrollPhoneAuthenticatorResponse.proceed)
        .toHaveBeenCalledWith('enroll-authenticator', {
          credentials: {
            passcode: 'test-code'
          }
        });
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'phone',
          authenticator: {
            displayName: 'Phone',
            id: '12',
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
        }
      });

      res = await register(authClient, { verificationCode });
      expect(enrollPhoneAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
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

      jest.spyOn(phoneEnrollmentDataResponse, 'proceed').mockRejectedValue(errorResponse);
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
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
            id: '9',
            key: 'phone_number',
            methods: [
              { type: 'sms' },
              { type: 'voice' }
            ],
            type: 'phone',
          },
          inputs: [
            { name: 'methodType', type: 'string', required: true },
            { name: 'phoneNumber', type: 'string', required: true }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'app',
          authenticator: {
            displayName: 'Google Authenticator',
            id: '13',
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

    it('can set an email on demand', async () => {
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'app',
          authenticator: {
            displayName: 'Google Authenticator',
            id: '13',
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          name: 'enroll-authenticator',
          type: 'app',
          authenticator: {
            displayName: 'Google Authenticator',
            id: '13',
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        status: IdxStatus.PENDING,
        nextStep: {
          canSkip: true,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticator',
            key: 'string',
          }],
          options: [{
            label: 'Phone',
            value: AuthenticatorKey.PHONE_NUMBER
          }]
        }
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        nextStep: {
          inputs: [
            {
              name: 'authenticator',
              key: 'string',
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
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
