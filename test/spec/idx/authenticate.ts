import { authenticate } from '../../../lib/idx/authenticate';
import { IdxStatus } from '../../../lib/idx/types';

import {
  chainResponses,
  IdentifyResponseFactory,
  IdentifyWithPasswordResponseFactory,
  VerifyPasswordResponseFactory,
  IdxResponseFactory,
  PhoneAuthenticatorEnrollmentDataRemediationFactory,
  EnrollPhoneAuthenticatorRemediationFactory,
  IdxErrorAccessDeniedFactory,
  IdxErrorIncorrectPassword,
  IdxErrorUserNotAssignedFactory,
  IdxErrorAuthenticationFailedFactory,
  RawIdxResponseFactory,
  IdxErrorNoAccountWithUsernameFactory,
  SelectAuthenticatorAuthenticateRemediationFactory,
  AuthenticatorValueFactory,
  PhoneAuthenticatorOptionFactory,
  EmailAuthenticatorOptionFactory,
  OktaVerifyAuthenticatorOptionFactory
} from '@okta/test.support/idx';
import { IdxMessagesFactory } from '@okta/test.support/idx/factories/messages';

jest.mock('@okta/okta-idx-js', () => {
  const { makeIdxState } = jest.requireActual('@okta/okta-idx-js').default;
  return {
    start: () => {},
    makeIdxState
  };
});

const mocked = {
  idx: require('@okta/okta-idx-js'),
};

describe('idx/authenticate', () => {
 let testContext;
  beforeEach(() => {
    const interactionCode = 'test-interactionCode';
    const stateHandle = 'test-stateHandle';
    const successResponse = IdxResponseFactory.build({
      interactionCode
    });

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

    testContext = {
      issuer,
      clientId,
      redirectUri,
      interactionCode,
      stateHandle,
      successResponse,
      tokenResponse,
      transactionMeta,
      authClient
    };
  });
  
  it('returns an auth transaction', async () => {
    const { authClient } = testContext;
    const identifyResponse =  IdentifyResponseFactory.build();
    jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);
    const res = await authenticate(authClient, {});
    expect(res).toEqual({
      status: IdxStatus.PENDING,
      tokens: null,
      nextStep: {
        canSkip: false,
        name: 'identify',
        inputs: [{
          name: 'username',
          label: 'Username'
        }]
      }
    });
  });

  describe('error handling', () => {

    describe('Profile enrollment is not enabled', () => {
      it('returns pending error "you do not have permission" when invalid username is provided', async () => {
        const { authClient } = testContext;
        const rawIdxState = RawIdxResponseFactory.build({
          messages: IdxMessagesFactory.build({
            value: [
              IdxErrorAccessDeniedFactory.build()
            ]
          })
        });
        const identifyResponse =  IdentifyResponseFactory.build();
        const errorResponse = Object.assign({}, identifyResponse, { rawIdxState });
        identifyResponse.proceed = jest.fn().mockResolvedValueOnce(errorResponse);
        jest.spyOn(mocked.idx, 'start').mockResolvedValueOnce(identifyResponse);

        const res = await authenticate(authClient, { username: 'obviously-wrong' });
        expect(res.status).toBe(IdxStatus.PENDING);
        expect(res.nextStep).toEqual({
          canSkip: undefined,
          name: 'identify',
          inputs: [{
            name: 'username',
            label: 'Username'
          }]
        });
        expect(res.error).toBe(undefined); // TODO: is this expected?
        expect(res.messages).toEqual([{
          class: 'ERROR',
          i18n: {
            key: 'security.access_denied'
          },
          message: 'You do not have permission to perform the requested action.'
        }]);
      });
    });

    describe('Profile enrollment is enabled', () => {
      it('returns pending error "No account with username" when invalid username is provided', async () => {
        const { authClient } = testContext;
        const username = 'obviously-wrong';
        const rawIdxState = RawIdxResponseFactory.build({
          messages: IdxMessagesFactory.build({
            value: [
              IdxErrorNoAccountWithUsernameFactory.build({}, {
                transient: { username }
              })
            ]
          })
        });
        const identifyResponse =  IdentifyResponseFactory.build();
        const errorResponse = Object.assign({}, identifyResponse, { rawIdxState });
        identifyResponse.proceed = jest.fn().mockResolvedValueOnce(errorResponse);
        jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);

        const res = await authenticate(authClient, { username });
        expect(res.status).toBe(IdxStatus.PENDING);
        expect(res.nextStep).toEqual({
          canSkip: undefined, // TODO: is this expected?
          name: 'identify',
          inputs: [{
            name: 'username',
            label: 'Username'
          }]
        });
        expect(res.error).toBe(undefined); // TODO: is this expected?
        expect(res.messages).toEqual([{
          class: 'INFO',
          i18n: {
            key: 'idx.unknown.user',
            params: []
          },
          message: 'There is no account with the Username obviously-wrong.'
        }]);
      });
    });

    it('returns terminal error when invalid password is provided', async () => {
      const { authClient } = testContext;
      const errorResponse = RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxErrorIncorrectPassword.build()
          ]
        })
      });

      const identifyResponse =  IdentifyResponseFactory.build();
      identifyResponse.proceed = jest.fn().mockRejectedValue(errorResponse);
      jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);

      const res = await authenticate(authClient, { username: 'myuser', password: 'invalid-password' });
      expect(res.status).toBe(IdxStatus.TERMINAL);
      expect(res.nextStep).toBe(undefined);
      expect(res.error).toBe(undefined); // TODO: is this expected?
      expect(res.messages).toEqual([{
        class: 'ERROR',
        i18n: {
          key: 'incorrectPassword'
        },
        message: 'Password is incorrect'
      }]);
    });

    it('returns terminal error when user account is deactivated or is not assigned to the application', async () => {
      const { authClient } = testContext;
      const errorResponse = RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxErrorUserNotAssignedFactory.build()
          ]
        })
      });
      const identifyResponse =  IdentifyResponseFactory.build();
      identifyResponse.proceed = jest.fn().mockRejectedValue(errorResponse);
      jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);

      const res = await authenticate(authClient, { username: 'myuser' });
      expect(res.status).toBe(IdxStatus.TERMINAL);
      expect(res.nextStep).toBe(undefined);
      expect(res.error).toBe(undefined); // TODO: is this expected?
      expect(res.messages).toEqual([{
        class: 'ERROR',
        i18n: {
          key: undefined // this error does not have an i18n key
        },
        message: 'User is not assigned to this application'
      }]);
    });

    it('returns terminal error when user account is locked or suspeneded', async () => {
      const { authClient } = testContext;
      const errorResponse = RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxErrorAuthenticationFailedFactory.build()
          ]
        })
      });
      const identifyResponse =  IdentifyResponseFactory.build();
      identifyResponse.proceed = jest.fn().mockRejectedValue(errorResponse);
      jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);

      const res = await authenticate(authClient, { username: 'myuser' });
      expect(res.status).toBe(IdxStatus.TERMINAL);
      expect(res.nextStep).toBe(undefined);
      expect(res.error).toBe(undefined); // TODO: is this expected?
      expect(res.messages).toEqual([{
        class: 'ERROR',
        i18n: {
          key: 'errors.E0000004'
        },
        message: 'Authentication failed'
      }]);
    });

  });

  describe('basic authentication', () => {

    describe('identifier first', () => {
      beforeEach(() => {
        const { successResponse } = testContext;
        const verifyPasswordResponse = VerifyPasswordResponseFactory.build();
        const identifyResponse =  IdentifyResponseFactory.build();
        chainResponses([
          identifyResponse,
          verifyPasswordResponse,
          successResponse
        ]);
        jest.spyOn(identifyResponse, 'proceed');
        jest.spyOn(verifyPasswordResponse, 'proceed');
        Object.assign(testContext, {
          identifyResponse,
          verifyPasswordResponse
        });
      });

      it('can authenticate, passing username and password up front', async () => {
        const { authClient, identifyResponse, verifyPasswordResponse, tokenResponse, interactionCode } = testContext;
        jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);
        const res = await authenticate(authClient, { username: 'fakeuser', password: 'fakepass' });
        expect(res).toEqual({
          'status': 0,
          'tokens': tokenResponse.tokens,
        });
        expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', { identifier: 'fakeuser' });
        expect(verifyPasswordResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', { credentials: { passcode: 'fakepass' }});
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

      it('can authenticate, passing username and password on demand', async () => {
        const { authClient, identifyResponse, verifyPasswordResponse, tokenResponse, interactionCode } = testContext;
        jest.spyOn(mocked.idx, 'start')
          .mockResolvedValueOnce(identifyResponse)
          .mockResolvedValueOnce(identifyResponse)
          .mockResolvedValueOnce(verifyPasswordResponse);

        // First call: returns identify response
        let res = await authenticate(authClient, {});
        expect(res.status).toBe(IdxStatus.PENDING);
        expect(res.nextStep).toEqual({
          canSkip: false,
          name: 'identify',
          inputs: [{
            name: 'username',
            label: 'Username'
          }]
        });

        // Second call: proceeds with identify response
        res = await authenticate(authClient, { username: 'myuser'});
        expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', { identifier: 'myuser' });
        expect(res.status).toBe(IdxStatus.PENDING);
        expect(res.nextStep).toEqual({
          canSkip: false,
          name: 'challenge-authenticator',
          type: 'password',
          inputs: [{
            name: 'password',
            label: 'Password',
            required: true,
            secret: true,
            type: 'string'
          }]
        });

        // Third call: proceeds with verify password
        res = await authenticate(authClient, { password: 'mypass'});
        expect(verifyPasswordResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', { credentials: { passcode: 'mypass' }});
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

    describe('identifier with password', () => {
      beforeEach(() => {
        const { successResponse } = testContext;
        const identifyResponse =  IdentifyWithPasswordResponseFactory.build();
        chainResponses([
          identifyResponse,
          successResponse
        ]);
        jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);
        jest.spyOn(identifyResponse, 'proceed');
        Object.assign(testContext, {
          identifyResponse,
        });
      });

      it('can authenticate, passing username and password up front', async () => {
        const { authClient, identifyResponse, tokenResponse, interactionCode } = testContext;
        const res = await authenticate(authClient, { username: 'fakeuser', password: 'fakepass' });
        expect(res).toEqual({
          'status': 0,
          'tokens': tokenResponse.tokens,
        });
        expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', {
          identifier: 'fakeuser',
          credentials: {
            passcode: 'fakepass'
          }
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

      it('can authenticate, passing username and password on demand', async () => {
        const { authClient, identifyResponse, tokenResponse, interactionCode } = testContext;
    
        // First call: returns identify response
        let res = await authenticate(authClient, {});
        expect(res.status).toBe(IdxStatus.PENDING);
        expect(res.nextStep).toEqual({
          canSkip: false,
          name: 'identify',
          inputs: [{
            name: 'username',
            label: 'Username'
          }, {
            name: 'password',
            label: 'Password',
            required: true,
            secret: true
          }]
        });

        // Second call: proceeds with identify response
        res = await authenticate(authClient, { username: 'myuser', password: 'mypass'});
        expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', {
          identifier: 'myuser',
          credentials: {
            passcode: 'mypass'
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

    });

  });

  describe('mfa authentication', () => {
    beforeEach(() => {
      const { successResponse } = testContext;

      const identifyResponse =  IdentifyResponseFactory.build();
      const verifyPasswordResponse = VerifyPasswordResponseFactory.build();
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
      const phoneEnrollmentDataResponse = IdxResponseFactory.build({
        neededToProceed: [
          PhoneAuthenticatorEnrollmentDataRemediationFactory.build()
        ]
      });
      const enrollPhoneResponse = IdxResponseFactory.build({
        neededToProceed: [
          EnrollPhoneAuthenticatorRemediationFactory.build()
        ]
      });

      chainResponses([
        identifyResponse,
        verifyPasswordResponse,
        selectAuthenticatorResponse,
        phoneEnrollmentDataResponse,
        enrollPhoneResponse,
        successResponse
      ]);

      jest.spyOn(identifyResponse, 'proceed');
      jest.spyOn(verifyPasswordResponse, 'proceed');
      jest.spyOn(selectAuthenticatorResponse, 'proceed');
      jest.spyOn(phoneEnrollmentDataResponse, 'proceed');
      jest.spyOn(enrollPhoneResponse, 'proceed');

      Object.assign(testContext, {
        identifyResponse,
        verifyPasswordResponse,
        selectAuthenticatorResponse,
        phoneEnrollmentDataResponse,
        enrollPhoneResponse
      });
    });

    it('can authenticate, passing username, password, phone number, and authenticators up front', async () => {
      const {
        authClient,
        identifyResponse,
        selectAuthenticatorResponse,
        verifyPasswordResponse,
        phoneEnrollmentDataResponse
      } = testContext;
      jest.spyOn(mocked.idx, 'start').mockResolvedValue(identifyResponse);
      const res = await authenticate(authClient, {
        username: 'fakeuser',
        password: 'fakepass',
        phoneNumber: '(555) 555-5555',
        authenticators: [
          'phone'
        ]
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
      expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', { identifier: 'fakeuser' });
      expect(verifyPasswordResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', { credentials: { passcode: 'fakepass' }});

      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-authenticate', {
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

      // TODO: proceed using code and verify that enrollPhoneResponse is called correctly
    });

    it('can authenticate, providing username, password, phoneNumber and code on demand', async () => {
      const {
        authClient,
        identifyResponse,
        selectAuthenticatorResponse,
        verifyPasswordResponse,
        phoneEnrollmentDataResponse
      } = testContext;

      jest.spyOn(mocked.idx, 'start')
        .mockResolvedValueOnce(identifyResponse)
        .mockResolvedValueOnce(identifyResponse)
        .mockResolvedValueOnce(verifyPasswordResponse)
        .mockResolvedValueOnce(selectAuthenticatorResponse)
        .mockResolvedValueOnce(phoneEnrollmentDataResponse);

      // First call: returns identify response
      let res = await authenticate(authClient, {});
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        canSkip: false,
        name: 'identify',
        inputs: [{
          name: 'username',
          label: 'Username'
        }]
      });

      // Second call: proceeds with identify response
      res = await authenticate(authClient, { username: 'myuser'});
      expect(identifyResponse.proceed).toHaveBeenCalledWith('identify', { identifier: 'myuser' });
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        canSkip: false,
        name: 'challenge-authenticator',
        type: 'password',
        inputs: [{
          name: 'password',
          label: 'Password',
          required: true,
          secret: true,
          type: 'string'
        }]
      });

      // Third call: proceeds with verify password
      res = await authenticate(authClient, { password: 'mypass'});
      expect(verifyPasswordResponse.proceed).toHaveBeenCalledWith('challenge-authenticator', { credentials: { passcode: 'mypass' }});
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        canSkip: false,
        name: 'select-authenticator-authenticate',
        inputs: [{
          name: 'authenticators',
          type: 'string[]',
        }],
        authenticators: [{
          label: 'Okta Verify',
          value: 'app'
        }, {
          label: 'Phone',
          value: 'phone'
        }, {
          label: 'Email',
          value: 'email'
        }]
      });

      // Fourth call: select authenticator
      res = await authenticate(authClient, { authenticators: ['phone'] });
      expect(selectAuthenticatorResponse.proceed).toHaveBeenCalledWith('select-authenticator-authenticate', { authenticator: { id: 'id-phone' }});
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
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
      });

      // Fifth call: send phone number
      res = await authenticate(authClient, { phoneNumber: '(555) 555-5555', authenticators: ['phone'] });
      expect(phoneEnrollmentDataResponse.proceed).toHaveBeenCalledWith('authenticator-enrollment-data', {
        authenticator: {
          id: 'id-phone',
          methodType: 'sms', // TODO: user should be able to specify methodType
          phoneNumber: '(555) 555-5555'
        }
      });
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        canSkip: false,
        name: 'enroll-authenticator',
        type: 'phone',
        inputs: [{
          label: 'Enter code',
          name: 'verificationCode',
          required: true,
          type: 'string',
        }]
      });

      // TODO: proceed using code and verify that enrollPhoneResponse is called correctly
    });

  });
});