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


import { interact } from '../../../lib/idx/interact';

jest.mock('../../../lib/http', () => {
  const actual = jest.requireActual('../../../lib/http');
  return {
    ...actual,
    httpRequest: () => {}
  };
});

jest.mock('../../../lib/idx/transactionMeta', () => {
  const actual = jest.requireActual('../../../lib/idx/transactionMeta');
  return {
    ...actual,
    getSavedTransactionMeta: () => {},
    saveTransactionMeta: () => {},
    // createTransactionMeta: () => {},
  };
});

const mocked = {
  http: require('../../../lib/http'),
  transactionMeta: require('../../../lib/idx/transactionMeta')
};

import { OktaAuth } from '@okta/okta-auth-js';

describe('idx/interact', () => {
  let testContext;

  beforeEach(() => {
    const transactionMeta = {
      state: 'meta-state',
      scopes: ['meta'],
      codeVerifier: 'meta-codeVerifier',
      codeChallenge: 'meta-codeChallenge',
      codeChallengeMethod: 'meta-codeChallengeMethod'
    };
    const authParams = {
      issuer: 'https://auth-js-test.okta.com',
      state: 'authClient-state',
      scopes: ['authClient'],
      clientId: 'authClient-clientId',
      redirectUri: 'authClient-redirectUri'
    };
    const tokenParams = {
      ...authParams,
      state: 'tp-state',
      scopes: ['tp-scopes'],
      codeChallenge: 'tp-codeChallenge',
      codeChallengeMethod: 'tp-codeChallengeMethod',
      codeVerifier: 'tp-codeVerifier',
      responseType: 'tp-responseType'
    };

    const authClient = new OktaAuth(authParams);

    jest.spyOn(mocked.transactionMeta, 'createTransactionMeta').mockImplementation((authClient, options) => {
      return Object.assign({}, tokenParams, authParams, options);
    });
    jest.spyOn(mocked.http, 'httpRequest').mockResolvedValue({interaction_handle: 'idx-interactionHandle'});

    testContext = {
      transactionMeta,
      authClient,
      tokenParams,
      authParams
    };
  });

  describe('no saved interactionHandle', () => {
    describe('with saved (valid) meta', () => {
      beforeEach(() => {
        const { transactionMeta } = testContext;
        jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
      });
  
      it('uses state/scopes from function options', async () => {
        const { authClient, transactionMeta } = testContext;
        jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
        const res = await interact(authClient, { state: 'fn-state', scopes: ['fn']});
        expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
          url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          args: ({
            client_id: 'authClient-clientId',
            scope: 'fn',
            redirect_uri: 'authClient-redirectUri',
            code_challenge: 'meta-codeChallenge',
            code_challenge_method: 'meta-codeChallengeMethod',
            state: 'fn-state',
          }),
          withCredentials: true
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'codeChallenge': 'meta-codeChallenge',
            'codeChallengeMethod': 'meta-codeChallengeMethod',
            'codeVerifier': 'meta-codeVerifier',
            'interactionHandle': 'idx-interactionHandle',
            'responseType': 'tp-responseType',
            'scopes': [
              'fn',
            ],
            'state': 'fn-state',
            'withCredentials': true,
          },
          'state': 'fn-state',
        });
      });

      it('uses `withCredentials` from function options', async () => {
        const { authClient, transactionMeta } = testContext;
        jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
        const res = await interact(authClient, { state: 'fn-state', scopes: ['fn'], withCredentials: false});
        expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
          url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          args: ({
            client_id: 'authClient-clientId',
            scope: 'fn',
            redirect_uri: 'authClient-redirectUri',
            code_challenge: 'meta-codeChallenge',
            code_challenge_method: 'meta-codeChallengeMethod',
            state: 'fn-state',
          }),
          withCredentials: false
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'codeChallenge': 'meta-codeChallenge',
            'codeChallengeMethod': 'meta-codeChallengeMethod',
            'codeVerifier': 'meta-codeVerifier',
            'interactionHandle': 'idx-interactionHandle',
            'responseType': 'tp-responseType',
            'scopes': [
              'fn',
            ],
            'state': 'fn-state',
            'withCredentials': false,
          },
          'state': 'fn-state',
        });
      });

      it('if no state/scopes in function option, uses values from meta', async () => {
        const { authClient } = testContext;
        const res = await interact(authClient, {});
        expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
          url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          args: ({
            client_id: 'authClient-clientId',
            scope: 'meta',
            redirect_uri: 'authClient-redirectUri',
            code_challenge: 'meta-codeChallenge',
            code_challenge_method: 'meta-codeChallengeMethod',
            state: 'meta-state',
          }),
          withCredentials: true
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'codeChallenge': 'meta-codeChallenge',
            'codeChallengeMethod': 'meta-codeChallengeMethod',
            'codeVerifier': 'meta-codeVerifier',
            'interactionHandle': 'idx-interactionHandle',
            'responseType': 'tp-responseType',
            'scopes': [
              'meta',
            ],
            'state': 'meta-state',
            'withCredentials': true,
          },
          'state': 'meta-state',
        });
      });

    });

    describe('no saved meta', () => {
      it('uses state/scopes from function options', async () => {
        const { authClient } = testContext;
        const res = await interact(authClient, { state: 'fn-state', scopes: ['fn']});
        expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
          url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          args: ({
            client_id: 'authClient-clientId',
            scope: 'fn',
            redirect_uri: 'authClient-redirectUri',
            code_challenge: 'tp-codeChallenge',
            code_challenge_method: 'tp-codeChallengeMethod',
            state: 'fn-state',
          }),
          withCredentials: true
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'codeVerifier': 'tp-codeVerifier',
            'interactionHandle': 'idx-interactionHandle',
            'responseType': 'tp-responseType',
            'scopes': [
              'fn',
            ],
            'state': 'fn-state',
            'withCredentials': true,
          },
          'state': 'fn-state',
        });
      });
  
      it('if no state/scopes in function option, uses values from authClient.options', async () => {
        const { authClient } = testContext;
        const res = await interact(authClient, {});
        expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
          url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          args: ({
            client_id: 'authClient-clientId',
            scope: 'authClient',
            redirect_uri: 'authClient-redirectUri',
            code_challenge: 'tp-codeChallenge',
            code_challenge_method: 'tp-codeChallengeMethod',
            state: 'authClient-state',
          }),
          withCredentials: true
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'codeVerifier': 'tp-codeVerifier',
            'interactionHandle': 'idx-interactionHandle',
            'responseType': 'tp-responseType',
            'scopes': [
              'authClient',
            ],
            'state': 'authClient-state',
            'withCredentials': true,
          },
          'state': 'authClient-state',
        });
      });
  
      it('if no state/scopes in function option or authClient.options, uses values from default token params', async () => {
        const { authClient, tokenParams } = testContext;
        // mocks `authParams` and `client.options` not existing
        jest.spyOn(mocked.transactionMeta, 'createTransactionMeta').mockImplementation(() => ({...tokenParams}));
        const res = await interact(authClient, {});
        expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
          url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          args: ({
            client_id: 'authClient-clientId',
            scope: 'tp-scopes',
            redirect_uri: 'authClient-redirectUri',
            code_challenge: 'tp-codeChallenge',
            code_challenge_method: 'tp-codeChallengeMethod',
            state: 'tp-state',
          }),
          withCredentials: true
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'codeVerifier': 'tp-codeVerifier',
            'interactionHandle': 'idx-interactionHandle',
            'responseType': 'tp-responseType',
            'scopes': [
              'tp-scopes',
            ],
            'state': 'tp-state',
            'withCredentials': true,
          },
          'state': 'tp-state',
        });
      });
  
      describe('activationToken', () => {
        beforeEach(() => {
          const { authParams } = testContext;
          authParams.activationToken = 'sdk-activationToken';
          const authClient = new OktaAuth(authParams);
          testContext.authClient = authClient;
        });

        it('uses activationToken from sdk options', async () => {
          const { authClient } = testContext;
          const res = await interact(authClient);
          expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
            url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            args: ({
              client_id: 'authClient-clientId',
              scope: 'authClient',
              redirect_uri: 'authClient-redirectUri',
              code_challenge: 'tp-codeChallenge',
              code_challenge_method: 'tp-codeChallengeMethod',
              state: 'authClient-state',
              activation_token: 'sdk-activationToken'
            }),
            withCredentials: true,
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'https://auth-js-test.okta.com',
              'redirectUri': 'authClient-redirectUri',
              'codeChallenge': 'tp-codeChallenge',
              'codeChallengeMethod': 'tp-codeChallengeMethod',
              'codeVerifier': 'tp-codeVerifier',
              'interactionHandle': 'idx-interactionHandle',
              'responseType': 'tp-responseType',
              'scopes': [
                'authClient',
              ],
              'state': 'authClient-state',
              'activationToken': 'sdk-activationToken',
              'withCredentials': true,
            },
            'state': 'authClient-state',
          });
        });
        it('uses activationToken from function options (overrides sdk option)', async () => {
          const { authClient } = testContext;
          const res = await interact(authClient, { activationToken: 'fn-activationToken' });
          expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
            url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            args: ({
              client_id: 'authClient-clientId',
              scope: 'authClient',
              redirect_uri: 'authClient-redirectUri',
              code_challenge: 'tp-codeChallenge',
              code_challenge_method: 'tp-codeChallengeMethod',
              state: 'authClient-state',
              activation_token: 'fn-activationToken'
            }),
            withCredentials: true
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'https://auth-js-test.okta.com',
              'redirectUri': 'authClient-redirectUri',
              'codeChallenge': 'tp-codeChallenge',
              'codeChallengeMethod': 'tp-codeChallengeMethod',
              'codeVerifier': 'tp-codeVerifier',
              'interactionHandle': 'idx-interactionHandle',
              'responseType': 'tp-responseType',
              'scopes': [
                'authClient',
              ],
              'state': 'authClient-state',
              'activationToken': 'fn-activationToken',
              'withCredentials': true,
            },
            'state': 'authClient-state',
          });
        });
      });

      describe('recoveryToken', () => {
        beforeEach(() => {
          const { authParams } = testContext;
          authParams.recoveryToken = 'sdk-recoveryToken';
          const authClient = new OktaAuth(authParams);
          testContext.authClient = authClient;
        });
        
        it('uses recoveryToken from sdk options', async () => {
          const { authClient } = testContext;
          const res = await interact(authClient);
          expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
            url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            args: ({
              client_id: 'authClient-clientId',
              scope: 'authClient',
              redirect_uri: 'authClient-redirectUri',
              code_challenge: 'tp-codeChallenge',
              code_challenge_method: 'tp-codeChallengeMethod',
              state: 'authClient-state',
              recovery_token: 'sdk-recoveryToken'
            }),
            withCredentials: true
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'https://auth-js-test.okta.com',
              'redirectUri': 'authClient-redirectUri',
              'codeChallenge': 'tp-codeChallenge',
              'codeChallengeMethod': 'tp-codeChallengeMethod',
              'codeVerifier': 'tp-codeVerifier',
              'interactionHandle': 'idx-interactionHandle',
              'responseType': 'tp-responseType',
              'scopes': [
                'authClient',
              ],
              'state': 'authClient-state',
              'recoveryToken': 'sdk-recoveryToken',
              'withCredentials': true,
            },
            'state': 'authClient-state',
          });
        });
        it('uses recoveryToken from function options (overrides sdk option)', async () => {
          const { authClient } = testContext;
          const res = await interact(authClient, { recoveryToken: 'fn-recoveryToken' });
          expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
            url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            args: ({
              client_id: 'authClient-clientId',
              scope: 'authClient',
              redirect_uri: 'authClient-redirectUri',
              code_challenge: 'tp-codeChallenge',
              code_challenge_method: 'tp-codeChallengeMethod',
              state: 'authClient-state',
              recovery_token: 'fn-recoveryToken'
            }),
            withCredentials: true
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'https://auth-js-test.okta.com',
              'redirectUri': 'authClient-redirectUri',
              'codeChallenge': 'tp-codeChallenge',
              'codeChallengeMethod': 'tp-codeChallengeMethod',
              'codeVerifier': 'tp-codeVerifier',
              'interactionHandle': 'idx-interactionHandle',
              'responseType': 'tp-responseType',
              'scopes': [
                'authClient',
              ],
              'state': 'authClient-state',
              'recoveryToken': 'fn-recoveryToken',
              'withCredentials': true,
            },
            'state': 'authClient-state',
          });
        });
      });

      // TODO: mock well-known endpoint???
      describe('clientSecret', () => {
        beforeEach(() => {
          // use original createTransactionMeta implementation
          jest.spyOn(mocked.transactionMeta, 'createTransactionMeta').mockRestore();
          jest.spyOn(mocked.transactionMeta, 'saveTransactionMeta');

          const { authParams, tokenParams } = testContext;
          authParams.clientSecret = 'sdk-clientSecret';
          const authClient = new OktaAuth(authParams);
          testContext.authClient = authClient;

          // mock `prepareTokenParams`
          testContext.authClient.token.prepareTokenParams = () => Promise.resolve(tokenParams);
        });

        it('uses clientSecret from sdk options', async () => {
          const { authClient } = testContext;
          await interact(authClient, {});
          expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
            url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            args: ({
              client_id: 'authClient-clientId',
              scope: 'tp-scopes',
              redirect_uri: 'authClient-redirectUri',
              code_challenge: 'tp-codeChallenge',
              code_challenge_method: 'tp-codeChallengeMethod',
              state: 'tp-state',
              client_secret: 'sdk-clientSecret'
            }),
            withCredentials: true
          });
          expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, {
            'clientId': 'authClient-clientId',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'codeVerifier': 'tp-codeVerifier',
            'flow': 'default',
            'interactionHandle': 'idx-interactionHandle',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'responseType': 'tp-responseType',
            'scopes': ['tp-scopes'],
            'state': 'tp-state',
            'urls': expect.any(Object),
            'withCredentials': true,
          });

        });
        it('uses clientSecret from function options (overrides sdk option)', async () => {
          const { authClient } = testContext;
          await interact(authClient, { clientSecret: 'fn-clientSecret' });
          expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
            url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            args: ({
              client_id: 'authClient-clientId',
              scope: 'tp-scopes',
              redirect_uri: 'authClient-redirectUri',
              code_challenge: 'tp-codeChallenge',
              code_challenge_method: 'tp-codeChallengeMethod',
              state: 'tp-state',
              client_secret: 'fn-clientSecret'
            }),
            withCredentials: true
          });
          expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, {
            'clientId': 'authClient-clientId',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'codeVerifier': 'tp-codeVerifier',
            'flow': 'default',
            'interactionHandle': 'idx-interactionHandle',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'responseType': 'tp-responseType',
            'scopes': ['tp-scopes'],
            'state': 'tp-state',
            'urls': expect.any(Object),
            'withCredentials': true,
          });
        });

      });

      describe('maxAge', () => {
        beforeEach(() => {
          const { authParams } = testContext;
          authParams.maxAge = 600;
          const authClient = new OktaAuth(authParams);
          testContext.authClient = authClient;
        });

        it('uses maxAge from SDK options', async () => {
          const { authClient } = testContext;
          const res = await interact(authClient);
          expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
            url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            args: ({
              client_id: 'authClient-clientId',
              scope: 'authClient',
              redirect_uri: 'authClient-redirectUri',
              code_challenge: 'tp-codeChallenge',
              code_challenge_method: 'tp-codeChallengeMethod',
              state: 'authClient-state',
              max_age: 600,
            }),
            withCredentials: true
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'https://auth-js-test.okta.com',
              'redirectUri': 'authClient-redirectUri',
              'codeChallenge': 'tp-codeChallenge',
              'codeChallengeMethod': 'tp-codeChallengeMethod',
              'codeVerifier': 'tp-codeVerifier',
              'interactionHandle': 'idx-interactionHandle',
              'responseType': 'tp-responseType',
              'scopes': [
                'authClient',
              ],
              'state': 'authClient-state',
              'maxAge': 600,
              'withCredentials': true
            },
            'state': 'authClient-state',
          });
        });
  
        it('uses maxAge from function options (overrides sdk option)', async () => {
          const { authClient } = testContext;
          const res = await interact(authClient, { maxAge: 900 });
          expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
            url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            args: ({
              client_id: 'authClient-clientId',
              scope: 'authClient',
              redirect_uri: 'authClient-redirectUri',
              code_challenge: 'tp-codeChallenge',
              code_challenge_method: 'tp-codeChallengeMethod',
              state: 'authClient-state',
              max_age: 900,
            }),
            withCredentials: true
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'https://auth-js-test.okta.com',
              'redirectUri': 'authClient-redirectUri',
              'codeChallenge': 'tp-codeChallenge',
              'codeChallengeMethod': 'tp-codeChallengeMethod',
              'codeVerifier': 'tp-codeVerifier',
              'interactionHandle': 'idx-interactionHandle',
              'responseType': 'tp-responseType',
              'scopes': [
                'authClient',
              ],
              'state': 'authClient-state',
              'maxAge': 900,
              'withCredentials': true
            },
            'state': 'authClient-state',
          });
        });
      });
  
      it('saves returned interactionHandle', async () => {
        const { authClient } = testContext;
        jest.spyOn(mocked.transactionMeta, 'saveTransactionMeta');
        await interact(authClient);
        expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, {
          'clientId': 'authClient-clientId',
          'issuer': 'https://auth-js-test.okta.com',
          'redirectUri': 'authClient-redirectUri',
          'codeChallenge': 'tp-codeChallenge',
          'codeChallengeMethod': 'tp-codeChallengeMethod',
          'codeVerifier': 'tp-codeVerifier',
          'interactionHandle': 'idx-interactionHandle',
          'responseType': 'tp-responseType',
          'scopes': ['authClient'],
          'state': 'authClient-state',
          'withCredentials': true,
        });
      });
    });

    describe('maxAge', () => {
      beforeEach(() => {
        const { authParams } = testContext;
        const authClient = new OktaAuth(authParams);
        testContext.authClient = authClient;
      });
      
      it('uses maxAge from function options', async () => {
        const { authClient } = testContext;
        const res = await interact(authClient, { maxAge: 900 });
        expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
          url: 'https://auth-js-test.okta.com/oauth2/v1/interact',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true,
          args: ({
            client_id: 'authClient-clientId',
            scope: 'authClient',
            redirect_uri: 'authClient-redirectUri',
            code_challenge: 'tp-codeChallenge',
            code_challenge_method: 'tp-codeChallengeMethod',
            state: 'authClient-state',
            max_age: 900
          }),
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'https://auth-js-test.okta.com',
            'redirectUri': 'authClient-redirectUri',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'codeVerifier': 'tp-codeVerifier',
            'interactionHandle': 'idx-interactionHandle',
            'responseType': 'tp-responseType',
            'scopes': [
              'authClient',
            ],
            'state': 'authClient-state',
            'withCredentials': true,
            'maxAge': 900
          },
          'state': 'authClient-state',
        });
      });
    });

  });

  describe('with saved interactionHandle', () => {
    beforeEach(() => {
      const { transactionMeta } = testContext;
      transactionMeta.interactionHandle = 'meta-interactionHandle';
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
    });

    it('should not make an /interact network call', async () => {
      const { authClient } = testContext;
      await interact(authClient);
      expect(mocked.http.httpRequest).not.toHaveBeenCalled();
    });

    it('returns saved meta', async () => {
      const { authClient, transactionMeta } = testContext;
      const res = await interact(authClient);
      expect(res).toEqual({
        meta: transactionMeta,
        interactionHandle: 'meta-interactionHandle',
        state: 'meta-state'
      });
    }); 
  });
});