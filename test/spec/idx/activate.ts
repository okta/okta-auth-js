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
import { activate } from '../../../lib/idx/activate';
import { IdxStatus, AuthenticatorKey } from '../../../lib/idx/types';
import { AuthSdkError } from '../../../lib/errors';

import {
  IdxResponseFactory,
  chainResponses,
  SelectAuthenticatorEnrollRemediationFactory,
  AuthenticatorValueFactory,
  PasswordAuthenticatorOptionFactory,
  EnrollPasswordAuthenticatorRemediationFactory,
  OktaVerifyAuthenticatorOptionFactory
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

describe('idx/activate', () => {
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
                 OktaVerifyAuthenticatorOptionFactory.build()
               ]
             })
           ]
         })
       ]
     });
 
 
     testContext = {
       authClient,
       tokenResponse,
       interactionCode,
       transactionMeta,
       selectPasswordResponse,
       enrollPasswordResponse,
       selectAuthenticatorResponse,
     };
   });

   it('requires activationToken to start', async () => {
    const { authClient } = testContext;
    jest.spyOn(authClient.transactionManager, 'exists').mockReturnValue(false);
    const res = await activate(authClient, {});
    expect(res.status).toBe(IdxStatus.FAILURE);
    expect(res.error).toBeInstanceOf(AuthSdkError);
    expect(res.error.errorSummary).toBe('No activationToken passed');
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
      let res = await activate(authClient, {
        activationToken: 'activation-token',
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
            label: 'Okta Verify',
            value: 'okta_verify'
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
      let res = await activate(authClient, {
        activationToken: 'activation-token',
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

      res = await activate(authClient, {
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
            label: 'Okta Verify',
            value: 'okta_verify'
          }]
        }
      });
    });
  });

});
