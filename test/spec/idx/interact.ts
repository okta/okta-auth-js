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

jest.mock('@okta/okta-idx-js', () => {
  const actual = jest.requireActual('@okta/okta-idx-js').default;
  return {
    client: actual.client,
    interact: () => {}
  };
});

jest.mock('../../../lib/idx/transactionMeta', () => {
  return {
    createTransactionMeta: () => {},
    getSavedTransactionMeta: () => {},
    saveTransactionMeta: () => {}
  };
});

const mocked = {
  idx: require('@okta/okta-idx-js'),
  transactionMeta: require('../../../lib/idx/transactionMeta')
};

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
      issuer: 'authClient-issuer',
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

    jest.spyOn(mocked.transactionMeta, 'createTransactionMeta').mockImplementation((authClient, options) => {
      return Object.assign({}, tokenParams, authParams, options);
    });
    jest.spyOn(mocked.idx, 'interact').mockResolvedValue('idx-interactionHandle');

    testContext = {
      transactionMeta,
      authClient: {
        options: authParams,
        token: {
          prepareTokenParams: () => Promise.resolve(tokenParams)
        },
      }
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
        expect(mocked.idx.interact).toHaveBeenCalledWith({
          'clientId': 'authClient-clientId',
          'baseUrl': 'authClient-issuer/oauth2',
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'redirectUri': 'authClient-redirectUri',
          'scopes': ['fn'],
          'state': 'fn-state',
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'authClient-issuer',
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
          },
          'state': 'fn-state',
        });
      });

      it('if no state/scopes in function option, uses values from meta', async () => {
        const { authClient } = testContext;
        const res = await interact(authClient, {});
        expect(mocked.idx.interact).toHaveBeenCalledWith({
          'clientId': 'authClient-clientId',
          'baseUrl': 'authClient-issuer/oauth2',
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'redirectUri': 'authClient-redirectUri',
          'scopes': ['meta'],
          'state': 'meta-state',
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'authClient-issuer',
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
          },
          'state': 'meta-state',
        });
      });

    });

    describe('no saved meta', () => {
      it('uses state/scopes from function options', async () => {
        const { authClient } = testContext;
        const res = await interact(authClient, { state: 'fn-state', scopes: ['fn']});
        expect(mocked.idx.interact).toHaveBeenCalledWith({
          'clientId': 'authClient-clientId',
          'baseUrl': 'authClient-issuer/oauth2',
          'codeChallenge': 'tp-codeChallenge',
          'codeChallengeMethod': 'tp-codeChallengeMethod',
          'redirectUri': 'authClient-redirectUri',
          'scopes': ['fn'],
          'state': 'fn-state',
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'authClient-issuer',
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
          },
          'state': 'fn-state',
        });
      });
  
      it('if no state/scopes in function option, uses values from authClient.options', async () => {
        const { authClient } = testContext;
        const res = await interact(authClient, {});
        expect(mocked.idx.interact).toHaveBeenCalledWith({
          'clientId': 'authClient-clientId',
          'baseUrl': 'authClient-issuer/oauth2',
          'codeChallenge': 'tp-codeChallenge',
          'codeChallengeMethod': 'tp-codeChallengeMethod',
          'redirectUri': 'authClient-redirectUri',
          'scopes': ['authClient'],
          'state': 'authClient-state',
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'authClient-issuer',
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
          },
          'state': 'authClient-state',
        });
      });
  
      it('if no state/scopes in function option or authClient.options, uses values from default token params', async () => {
        const { authClient } = testContext;
        delete authClient.options.state;
        delete authClient.options.scopes;
        const res = await interact(authClient, {});
        expect(mocked.idx.interact).toHaveBeenCalledWith({
          'clientId': 'authClient-clientId',
          'baseUrl': 'authClient-issuer/oauth2',
          'codeChallenge': 'tp-codeChallenge',
          'codeChallengeMethod': 'tp-codeChallengeMethod',
          'redirectUri': 'authClient-redirectUri',
          'scopes': ['tp-scopes'],
          'state': 'tp-state',
        });
        expect(res).toEqual({
          'interactionHandle': 'idx-interactionHandle',
          'meta': {
            'clientId': 'authClient-clientId',
            'issuer': 'authClient-issuer',
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
          },
          'state': 'tp-state',
        });
      });
  
      describe('activationToken', () => {
        it('uses activationToken from sdk options', async () => {
          const { authClient } = testContext;
          authClient.options.activationToken = 'sdk-activationToken';
          const res = await interact(authClient);
          expect(mocked.idx.interact).toHaveBeenCalledWith({
            'clientId': 'authClient-clientId',
            'baseUrl': 'authClient-issuer/oauth2',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'redirectUri': 'authClient-redirectUri',
            'scopes': ['authClient'],
            'state': 'authClient-state',
            'activationToken': 'sdk-activationToken'
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'authClient-issuer',
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
              'activationToken': 'sdk-activationToken'
            },
            'state': 'authClient-state',
          });
        });
        it('uses activationToken from function options (overrides sdk option)', async () => {
          const { authClient } = testContext;
          authClient.options.activationToken = 'sdk-activationToken';
          const res = await interact(authClient, { activationToken: 'fn-activationToken' });
          expect(mocked.idx.interact).toHaveBeenCalledWith({
            'clientId': 'authClient-clientId',
            'baseUrl': 'authClient-issuer/oauth2',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'redirectUri': 'authClient-redirectUri',
            'scopes': ['authClient'],
            'state': 'authClient-state',
            'activationToken': 'fn-activationToken'
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'authClient-issuer',
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
              'activationToken': 'fn-activationToken'
            },
            'state': 'authClient-state',
          });
        });
      });

      describe('recoveryToken', () => {
        it('uses recoveryToken from sdk options', async () => {
          const { authClient } = testContext;
          authClient.options.recoveryToken = 'sdk-recoveryToken';
          const res = await interact(authClient, { recoveryToken: 'sdk-recoveryToken' });
          expect(mocked.idx.interact).toHaveBeenCalledWith({
            'clientId': 'authClient-clientId',
            'baseUrl': 'authClient-issuer/oauth2',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'redirectUri': 'authClient-redirectUri',
            'scopes': ['authClient'],
            'state': 'authClient-state',
            'recoveryToken': 'sdk-recoveryToken'
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'authClient-issuer',
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
              'recoveryToken': 'sdk-recoveryToken'
            },
            'state': 'authClient-state',
          });
        });
        it('uses recoveryToken from function options (overrides sdk option)', async () => {
          const { authClient } = testContext;
          authClient.options.recoveryToken = 'sdk-recoveryToken';
          const res = await interact(authClient, { recoveryToken: 'fn-recoveryToken' });
          expect(mocked.idx.interact).toHaveBeenCalledWith({
            'clientId': 'authClient-clientId',
            'baseUrl': 'authClient-issuer/oauth2',
            'codeChallenge': 'tp-codeChallenge',
            'codeChallengeMethod': 'tp-codeChallengeMethod',
            'redirectUri': 'authClient-redirectUri',
            'scopes': ['authClient'],
            'state': 'authClient-state',
            'recoveryToken': 'fn-recoveryToken'
          });
          expect(res).toEqual({
            'interactionHandle': 'idx-interactionHandle',
            'meta': {
              'clientId': 'authClient-clientId',
              'issuer': 'authClient-issuer',
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
              'recoveryToken': 'fn-recoveryToken'
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
          'issuer': 'authClient-issuer',
          'redirectUri': 'authClient-redirectUri',
          'codeChallenge': 'tp-codeChallenge',
          'codeChallengeMethod': 'tp-codeChallengeMethod',
          'codeVerifier': 'tp-codeVerifier',
          'interactionHandle': 'idx-interactionHandle',
          'responseType': 'tp-responseType',
          'scopes': ['authClient'],
          'state': 'authClient-state'
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

    it('should not call idx.interact', async () => {
      const { authClient } = testContext;
      await interact(authClient);
      expect(mocked.idx.interact).not.toHaveBeenCalled();
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