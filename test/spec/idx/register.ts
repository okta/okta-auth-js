/* eslint-disable max-statements */
import { register } from '../../../lib/idx/register';
import { IdxStatus } from '../../../lib/idx/types';
import { AuthSdkError } from '../../../lib/errors';

import {
  IdxResponseFactory,
  IdentifyRemediationFactory,
  SelectEnrollProfileRemediationFactory,
  EnrollProfileRemediationFactory,
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
  SelectAuthenticatorAuthenticateRemediationFactory
} from '@okta/test.support/idx';

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
        saveIdxResponse: () => {}
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
                EmailAuthenticatorOptionFactory.build()
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


    testContext = {
      authClient,
      tokenResponse,
      interactionCode,
      transactionMeta,
      successWithInteractionCodeResponse,
      successCheckEmailResponse,
      identifyResponse,
      enrollProfileResponse,
      selectPasswordResponse,
      enrollPasswordResponse,
      selectAuthenticatorResponse,
      enrollEmailAuthenticatorResponse,
      selectPhoneResponse,
      phoneEnrollmentDataResponse,
      enrollPhoneAuthenticatorResponse
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
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticators',
            type: 'string[]',
          }],
          authenticators: [{
            label: 'Password',
            value: 'password'
          }]
        }
      });
    });

    // eslint-disable-next-line jasmine/no-disabled-tests
    xit('can register, passing firstName, lastName, and email on demand', async () => {
      // TODO
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
        authenticators: ['password']
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
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticators',
            type: 'string[]',
          }],
          authenticators: [{
            label: 'Phone',
            value: 'phone'
          }, {
            label: 'Email',
            value: 'email'
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
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticators',
            type: 'string[]',
          }],
          authenticators: [{
            label: 'Password',
            value: 'password'
          }]
        }
      });
      res = await register(authClient, { password, authenticators: ['password']});
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
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticators',
            type: 'string[]',
          }],
          authenticators: [{
            label: 'Phone',
            value: 'phone'
          }, {
            label: 'Email',
            value: 'email'
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
        authenticators: ['email']
      });
      // Email authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-email'
        }
      });
      expect(res).toEqual({
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'enroll-authenticator',
          type: 'email',
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
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticators',
            type: 'string[]',
          }],
          authenticators: [{
            label: 'Phone',
            value: 'phone'
          }, {
            label: 'Email',
            value: 'email'
          }]
        }
      });

      res = await register(authClient, {
        email: 'boblawbla@bobslawblog.com',
        authenticators: ['email']
      });
      // Email authenticator is automatically selected
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-email'
        }
      });
      expect(res).toEqual({
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'enroll-authenticator',
          type: 'email',
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
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'enroll-authenticator',
          type: 'email',
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
      res = await register(authClient, { verificationCode, authenticators: ['email'] });
      expect(enrollEmailAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toEqual({
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: true,
          name: 'select-authenticator-enroll',
          inputs: [{
            name: 'authenticators',
            type: 'string[]',
          }],
          authenticators: [{
            label: 'Phone',
            value: 'phone'
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
        status: IdxStatus.PENDING,
        tokens: null,
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
          canSkip: undefined, // TODO: is this expected?
          name: 'enroll-profile',
          inputs: [{
            label: 'First name',
            maxLength: 50,
            minLength: 1,
            name: 'firstName',
            required: true
          },
          // TODO: where are the other inputs?
          ]
        }
      });
    });
  });

  describe('phone', () => {
    it('can set up a phone up front', async () => {
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
      let res = await register(authClient, { phoneNumber: '(555) 555-5555', authenticators: ['phone'] });
      expect(selectPhoneResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-phone'
        }
      });
      expect(phoneEnrollmentDataResponse.proceed).toHaveBeenCalledWith('authenticator-enrollment-data', {
        authenticator: {
          id: 'id-phone',
          methodType: 'sms', // TODO: user should be able to specify methodType
          phoneNumber: '(555) 555-5555'
        }
      });
      expect(res).toEqual({
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'enroll-authenticator',
          type: 'phone',
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        }
      });

      res = await register(authClient, { verificationCode, authenticators: ['phone'] });
      expect(enrollPhoneAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toEqual({
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

      let res = await register(authClient, { authenticators: ['phone'] });
      expect(selectPhoneResponse.proceed).toHaveBeenCalledWith('select-authenticator-enroll', {
        authenticator: {
          id: 'id-phone'
        }
      });
      expect(res).toEqual({
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'authenticator-enrollment-data',
          type: 'phone',
          inputs: [{
            label: 'Phone',
            name: 'authenticator',
            form: {
              value: [{
                name: 'id',
                required: true,
                value: 'id-phone'
              }, {
                name: 'methodType',
                options: [{
                  label: 'SMS',
                  value: 'sms'
                }, {
                  label: 'Voice call',
                  value: 'voice'
                }],
                required: true
              }, {
                name: 'phoneNumber',
                required: true
              }]
            }
          }]
        }
      });

      res = await register(authClient, { phoneNumber: '(555) 555-5555', authenticators: ['phone'] });
      expect(phoneEnrollmentDataResponse.proceed).toHaveBeenCalledWith('authenticator-enrollment-data', {
        authenticator: {
          id: 'id-phone',
          methodType: 'sms', // TODO: user should be able to specify methodType
          phoneNumber: '(555) 555-5555'
        }
      });
      expect(res).toEqual({
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'enroll-authenticator',
          type: 'phone',
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        }
      });

      res = await register(authClient, { verificationCode, authenticators: ['phone'] });
      expect(enrollPhoneAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toEqual({
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
        status: IdxStatus.PENDING,
        tokens: null,
        nextStep: {
          canSkip: false,
          name: 'enroll-authenticator',
          type: 'phone',
          inputs: [{
            label: 'Enter code',
            name: 'verificationCode',
            required: true,
            type: 'string',
          }]
        }
      });

      res = await register(authClient, { verificationCode, authenticators: ['phone'] });
      expect(enrollPhoneAuthenticatorResponse.proceed).toHaveBeenCalledWith('enroll-authenticator', {
        credentials: {
          passcode: 'test-code'
        }
      });
      expect(res).toEqual({
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

      const errorResponse = RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxErrorEnrollmentInvalidPhoneFactory.build()
          ]
        }),
        remediation: {
          type: 'array',
          value: [
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
        }
      });

      jest.spyOn(phoneEnrollmentDataResponse, 'proceed').mockRejectedValue(errorResponse);
      jest.spyOn(mocked.introspect, 'introspect')
        .mockResolvedValueOnce(phoneEnrollmentDataResponse);

      const phoneNumber = 'obviously-not-valid';
      let res = await register(authClient, { phoneNumber, authenticators: ['phone'] });
      expect(phoneEnrollmentDataResponse.proceed).toHaveBeenCalledWith('authenticator-enrollment-data', {
        authenticator: {
          id: 'id-phone',
          methodType: 'sms', // TODO: user should be able to specify methodType
          phoneNumber
        }
      });
      expect(res).toEqual({
        status: IdxStatus.PENDING,
        tokens: null,
        messages: [{
          class: 'ERROR',
          i18n: {
            key: undefined // this error does not have an i18n key
          },
          message: 'Unable to initiate factor enrollment: Invalid Phone Number.'
        }],
        nextStep: {
          canSkip: undefined, // TODO: is this expected?
          name: 'authenticator-enrollment-data',
          type: 'phone',
          inputs: [{
            label: 'Phone',
            name: 'authenticator',
            form: {
              value: [{
                name: 'id',
                required: true,
                value: 'id-phone'
              }, {
                name: 'methodType',
                options: [{
                  label: 'SMS',
                  value: 'sms'
                }, {
                  label: 'Voice call',
                  value: 'voice'
                }],
                required: true
              }, {
                name: 'phoneNumber',
                required: true
              }]
            }
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
        .mockResolvedValueOnce(selectPhoneResponse);
      jest.spyOn(authClient.token, 'exchangeCodeForTokens');

      const res = await register(authClient, { skip: true });
      expect(selectPhoneResponse.proceed).toHaveBeenCalledWith('skip', {});
      expect(res).toEqual({
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
  });

});
