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
    getTransactionMeta: () => {},
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
    jest.spyOn(mocked.transactionMeta, 'getTransactionMeta').mockResolvedValue(transactionMeta);
    jest.spyOn(mocked.idx, 'interact').mockResolvedValue('idx-interactionHandle');

    testContext = {
      transactionMeta,
      authClient: {
        options: {
          issuer: 'authClient-issuer',
          state: 'authClient-state',
          scopes: ['authClient'],
          clientId: 'authClient-clientId',
          redirectUri: 'authClient-redirectUri'
        }
      }
    };
  });

  describe('no saved interactionHandle', () => {
    it('uses state/scopes from function options', async () => {
      const { authClient } = testContext;
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
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'codeVerifier': 'meta-codeVerifier',
          'interactionHandle': 'idx-interactionHandle',
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
        'codeChallenge': 'meta-codeChallenge',
        'codeChallengeMethod': 'meta-codeChallengeMethod',
        'redirectUri': 'authClient-redirectUri',
        'scopes': ['authClient'],
        'state': 'authClient-state',
      });
      expect(res).toEqual({
        'interactionHandle': 'idx-interactionHandle',
        'meta': {
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'codeVerifier': 'meta-codeVerifier',
          'interactionHandle': 'idx-interactionHandle',
          'scopes': [
            'authClient',
          ],
          'state': 'authClient-state',
        },
        'state': 'authClient-state',
      });
    });

    it('if no state/scopes in function option or authClient.options, uses values from meta', async () => {
      const { authClient } = testContext;
      authClient.options.state = undefined;
      authClient.options.scopes = undefined;
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
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'codeVerifier': 'meta-codeVerifier',
          'interactionHandle': 'idx-interactionHandle',
          'scopes': [
            'meta',
          ],
          'state': 'meta-state',
        },
        'state': 'meta-state',
      });
    });

    it('uses activationToken from function options', async () => {
      const { authClient } = testContext;
      const res = await interact(authClient, { activationToken: 'fn-activationToken' });
      expect(mocked.idx.interact).toHaveBeenCalledWith({
        'clientId': 'authClient-clientId',
        'baseUrl': 'authClient-issuer/oauth2',
        'codeChallenge': 'meta-codeChallenge',
        'codeChallengeMethod': 'meta-codeChallengeMethod',
        'redirectUri': 'authClient-redirectUri',
        'scopes': ['authClient'],
        'state': 'authClient-state',
        'activationToken': 'fn-activationToken'
      });
      expect(res).toEqual({
        'interactionHandle': 'idx-interactionHandle',
        'meta': {
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'codeVerifier': 'meta-codeVerifier',
          'interactionHandle': 'idx-interactionHandle',
          'scopes': [
            'authClient',
          ],
          'state': 'authClient-state',
        },
        'state': 'authClient-state',
      });
    });

    it('saves returned interactionHandle', async () => {
      const { authClient } = testContext;
      jest.spyOn(mocked.transactionMeta, 'saveTransactionMeta');
      await interact(authClient);
      expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, {
        'codeChallenge': 'meta-codeChallenge',
        'codeChallengeMethod': 'meta-codeChallengeMethod',
        'codeVerifier': 'meta-codeVerifier',
        'interactionHandle': 'idx-interactionHandle',
        'scopes': ['authClient'],
        'state': 'authClient-state'
      });
    });

  });

  describe('with saved interactionHandle', () => {
    beforeEach(() => {
      testContext.transactionMeta.interactionHandle = 'meta-interactionHandle';
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