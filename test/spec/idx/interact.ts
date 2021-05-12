import { interact } from '../../../lib/idx/interact';

jest.mock('@okta/okta-idx-js', () => {
  return {
    start: () => {}
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
    jest.spyOn(mocked.transactionMeta, 'getTransactionMeta').mockImplementation(() => Promise.resolve(transactionMeta));
    
    const idxResponse = {
      context: {
        stateHandle: 'idx-stateHandle'
      },
      toPersist: {
        interactionHandle: 'idx-interactionHandle'
      }
    };
    jest.spyOn(mocked.idx, 'start').mockImplementation(() => Promise.resolve(idxResponse));

    testContext = {
      idxResponse,
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
      const { authClient, idxResponse } = testContext;
      const res = await interact(authClient, { state: 'fn-state', scopes: ['fn']});
      expect(mocked.idx.start).toHaveBeenCalledWith({
        'clientId': 'authClient-clientId',
        'codeChallenge': 'meta-codeChallenge',
        'codeChallengeMethod': 'meta-codeChallengeMethod',
        'codeVerifier': 'meta-codeVerifier',
        'interactionHandle': undefined,
        'issuer':  'authClient-issuer',
        'redirectUri': 'authClient-redirectUri',
        'scopes': ['fn'],
        'state': 'fn-state',
        'version': '1.0.0'
      });
      expect(res).toEqual({
        idxResponse,
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
        'stateHandle': 'idx-stateHandle',
      });
    });

    it('if no state/scopes in function option, uses values from authClient.options', async () => {
      const { authClient, idxResponse } = testContext;
      const res = await interact(authClient, {});
      expect(mocked.idx.start).toHaveBeenCalledWith({
        'clientId': 'authClient-clientId',
        'codeChallenge': 'meta-codeChallenge',
        'codeChallengeMethod': 'meta-codeChallengeMethod',
        'codeVerifier': 'meta-codeVerifier',
        'interactionHandle': undefined,
        'issuer':  'authClient-issuer',
        'redirectUri': 'authClient-redirectUri',
        'scopes': ['authClient'],
        'state': 'authClient-state',
        'version': '1.0.0'
      });
      expect(res).toEqual({
        idxResponse,
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
        'stateHandle': 'idx-stateHandle',
      });
    });

    it('if no state/scopes in function option or authClient.options, uses values from meta', async () => {
      const { authClient, idxResponse } = testContext;
      authClient.options.state = undefined;
      authClient.options.scopes = undefined;
      const res = await interact(authClient, {});
      expect(mocked.idx.start).toHaveBeenCalledWith({
        'clientId': 'authClient-clientId',
        'codeChallenge': 'meta-codeChallenge',
        'codeChallengeMethod': 'meta-codeChallengeMethod',
        'codeVerifier': 'meta-codeVerifier',
        'interactionHandle': undefined,
        'issuer':  'authClient-issuer',
        'redirectUri': 'authClient-redirectUri',
        'scopes': ['meta'],
        'state': 'meta-state',
        'version': '1.0.0'
      });
      expect(res).toEqual({
        idxResponse,
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
        'stateHandle': 'idx-stateHandle',
      });
    });

    describe('idxResponse contains an interactionHandle', () => {
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

    describe('idxResponse does not contain an interactionHandle', () => {
      beforeEach(() => {
        testContext.idxResponse.toPersist = {};
      });
      // TODO: should we save transaction in this state?
      it('saves transaction meta without interactionHandle', async () => {
        const { authClient } = testContext;
        jest.spyOn(mocked.transactionMeta, 'saveTransactionMeta');
        await interact(authClient);
        expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, {
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'codeVerifier': 'meta-codeVerifier',
          'scopes': ['authClient'],
          'state': 'authClient-state'
        });
      });
    });
  });

  describe('with saved interactionHandle', () => {
    beforeEach(() => {
      testContext.transactionMeta.interactionHandle = 'meta-interactionHandle';
    });

    it('uses state/scopes from meta', async () => {
      const { authClient, idxResponse } = testContext;
      const res = await interact(authClient, { state: 'fn-state', scopes: ['fn']});
      expect(mocked.idx.start).toHaveBeenCalledWith({
        'clientId': 'authClient-clientId',
        'codeChallenge': 'meta-codeChallenge',
        'codeChallengeMethod': 'meta-codeChallengeMethod',
        'codeVerifier': 'meta-codeVerifier',
        'interactionHandle': 'meta-interactionHandle',
        'issuer':  'authClient-issuer',
        'redirectUri': 'authClient-redirectUri',
        'scopes': ['meta'],
        'state': 'meta-state',
        'version': '1.0.0'
      });
      expect(res).toEqual({
        idxResponse,
        'interactionHandle': 'meta-interactionHandle',
        'meta': {
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'codeVerifier': 'meta-codeVerifier',
          'interactionHandle': 'meta-interactionHandle',
          'scopes': [
            'meta',
          ],
          'state': 'meta-state',
        },
        'state': 'meta-state',
        'stateHandle': 'idx-stateHandle',
      });
    });

    describe('idxResponse contains an interactionHandle', () => {
      it('saves current interactionHandle', async () => {
        const { authClient } = testContext;
        jest.spyOn(mocked.transactionMeta, 'saveTransactionMeta');
        await interact(authClient);
        expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, {
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'codeVerifier': 'meta-codeVerifier',
          'interactionHandle': 'meta-interactionHandle',
          'scopes': ['meta'],
          'state': 'meta-state'
        });
      });
    });

    describe('idxResponse does not contain an interactionHandle', () => {
      beforeEach(() => {
        testContext.idxResponse.toPersist = {};
      });
      it('saves current interactionHandle', async () => {
        const { authClient } = testContext;
        jest.spyOn(mocked.transactionMeta, 'saveTransactionMeta');
        await interact(authClient);
        expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, {
          'interactionHandle': 'meta-interactionHandle',
          'codeChallenge': 'meta-codeChallenge',
          'codeChallengeMethod': 'meta-codeChallengeMethod',
          'codeVerifier': 'meta-codeVerifier',
          'scopes': ['meta'],
          'state': 'meta-state'
        });
      });
    });

  });

});