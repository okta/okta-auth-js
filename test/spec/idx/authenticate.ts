import { authenticate } from '../../../lib/idx/authenticate';
import { IdxStatus } from '../../../lib/idx/types';

import {
  chainResponses,
  SuccessResponseFactory,
  IdentifyResponseFactory,
  IdentifyWithPasswordResponseFactory,
  VerifyPasswordResponseFactory,
  SelectAuthenticatorResponseFactory,
  IdxResponseFactory,
  PhoneAuthenticatorEnrollmentDataRemediationFactory,
  EnrollPhoneAuthenticatorRemediationFactory
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
      stateHandle,
      successResponse,
      tokenResponse,
      transactionMeta,
      authClient
    };
  });
  
  it('returns an auth transaction', async () => {
    const { authClient, successResponse, stateHandle, tokenResponse } = testContext;
    const identifyResponse =  IdentifyResponseFactory.build();
    chainResponses([
      identifyResponse,
      successResponse
    ]);
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({
      idxResponse: identifyResponse,
      stateHandle 
    });
    const res = await authenticate(authClient, { username: 'fake' });
    expect(res).toEqual({
      'status': 0,
      'tokens': tokenResponse.tokens,
    });
  });

  describe('basic authentication', () => {

    describe('identifier first', () => {
      beforeEach(() => {
        const { stateHandle, successResponse } = testContext;
        const verifyPasswordResponse = VerifyPasswordResponseFactory.build();
        const identifyResponse =  IdentifyResponseFactory.build();
        chainResponses([
          identifyResponse,
          verifyPasswordResponse,
          successResponse
        ]);
        jest.spyOn(mocked.interact, 'interact').mockResolvedValue({
          idxResponse: identifyResponse,
          stateHandle 
        });
        jest.spyOn(identifyResponse, 'proceed');
        jest.spyOn(verifyPasswordResponse, 'proceed');
        Object.assign(testContext, {
          identifyResponse,
          verifyPasswordResponse
        });
      });

      it('can authenticate, passing username and password up front', async () => {
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

      xit('can authenticate, passing username and password on demand', async () => {
        const { authClient } = testContext;
        const res = await authenticate(authClient, {});
        // TODO
      });

    });

    describe('identifier with password', () => {
      beforeEach(() => {
        const { stateHandle, successResponse } = testContext;
        const identifyResponse =  IdentifyWithPasswordResponseFactory.build();
        chainResponses([
          identifyResponse,
          successResponse
        ]);
        jest.spyOn(mocked.interact, 'interact').mockResolvedValue({
          idxResponse: identifyResponse,
          stateHandle 
        });
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

      xit('can authenticate, passing username and password on demand', async () => {
        const { authClient } = testContext;
        const res = await authenticate(authClient, {});
        // TODO
      });

    });

  });

  describe('mfa authentication', () => {
    beforeEach(() => {
      const { stateHandle, successResponse } = testContext;

      const identifyResponse =  IdentifyResponseFactory.build();
      const verifyPasswordResponse = VerifyPasswordResponseFactory.build();
      const selectAuthenticatorResponse = SelectAuthenticatorResponseFactory.build();
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

      jest.spyOn(mocked.interact, 'interact').mockResolvedValue({
        idxResponse: identifyResponse,
        stateHandle 
      });
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
      const res = await authenticate(authClient, {
        username: 'fakeuser',
        password: 'fakepass',
        phoneNumber: '(555) 555-5555',
        authenticators: [
          'phone'
        ]
      });
      expect(res.status).toBe(IdxStatus.PENDING);
      expect(res.nextStep).toEqual({
        canSkip: false,
        name: 'enroll-authenticator',
        type: 'phone'
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

    xit('can authenticate, providing username, password, phoneNumber and code on demand', () => {
      // TODO
    });

  });
});