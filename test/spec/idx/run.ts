import { run } from '../../../lib/idx/run';
import { AuthTransaction } from '../../../lib/tx';
import LoopMonitor from '../../../lib/idx/RemediationLoopMonitor';

jest.mock('../../../lib/idx/interact', () => {
  return {
    interact: () => {}
  };
});

jest.mock('../../../lib/idx/remediate', () => {
  return {
    remediate: () => {}
  };
});


const mocked = {
  interact: require('../../../lib/idx/interact'),
  remediate: require('../../../lib/idx/remediate')
};

describe('idx/run', () => {
  let testContext;
  beforeEach(() => {
    const interactResponse = {
      idxResponse: {},
      stateHandle: 'idx-stateHandle'
    };
    jest.spyOn(mocked.interact, 'interact').mockImplementation(() => interactResponse);

    const remediateResponse = {
      idxResponse: {},
      nextStep: 'remediate-nextStep',
      formError: undefined,
      terminal: false
    };
    jest.spyOn(mocked.remediate, 'remediate').mockImplementation(() => remediateResponse);

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
    const options = {
      flow: {
        'fake': true
      },
      allowedNextSteps: [],
      actions: []
    };
    testContext = {
      interactResponse,
      remediateResponse,
      tokenResponse,
      transactionMeta,
      authClient,
      options
    };
  });

  it('returns transaction', async () => {
    const { authClient, options } = testContext;
    const res = await run(authClient, options);
    expect(res instanceof AuthTransaction).toBe(true);
    expect(res).toEqual({
      'data': {
        'nextStep': 'remediate-nextStep',
        'status': 1,
        'terminal': false,
        'tokens': null,
      },
      'nextStep': 'remediate-nextStep',
      'status': 1,
      'terminal': false,
      'tokens': null,
    });
  });

  it('calls interact, passing options through', async () => {
    const { authClient, options } = testContext;
    await run(authClient, options);
    expect(mocked.interact.interact).toHaveBeenCalledWith(authClient, options);
  });

  it('calls remediaate, passing options and values through', async () => {
    const { authClient, options, interactResponse } = testContext;
    const { idxResponse, stateHandle } = interactResponse;
    const values = { ...options, stateHandle };
    await run(authClient, options);
    expect(mocked.remediate.remediate).toHaveBeenCalledWith(idxResponse, values, expect.any(LoopMonitor), options);
  });

  it('returns form error in transaction', async () => {
    testContext.remediateResponse.formError = 'remediate-formError';
    const { authClient, options } = testContext;
    const res = await run(authClient, options);
    expect(res instanceof AuthTransaction).toBe(true);
    expect(res).toEqual({
      'data': {
        'error': 'remediate-formError',
        'nextStep': 'remediate-nextStep',
        'status': 1,
        'terminal': false,
        'tokens': null,
      },
      'error': 'remediate-formError',
      'nextStep': 'remediate-nextStep',
      'status': 1,
      'terminal': false,
      'tokens': null,
    });
  });

  describe('response is not terminal', () => {
    beforeEach(() => {
      testContext.remediateResponse.terminal = false;
    });

    it('does not clear transaction storage', async () => {
      const { authClient, options } = testContext;
      jest.spyOn(authClient.transactionManager, 'clear');
      const res = await run(authClient, options);
      expect(authClient.transactionManager.clear).not.toHaveBeenCalledWith();
      expect(res instanceof AuthTransaction).toBe(true);
      expect(res).toEqual({
        'data': {
          'nextStep': 'remediate-nextStep',
          'status': 1,
          'terminal': false,
          'tokens': null,
        },
        'nextStep': 'remediate-nextStep',
        'status': 1,
        'terminal': false,
        'tokens': null,
      });
    });
  });

  describe('response is terminal', () => {
    beforeEach(() => {
      testContext.remediateResponse.terminal = true;
    });

    it('clears transaction storage', async () => {
      const { authClient, options } = testContext;
      jest.spyOn(authClient.transactionManager, 'clear');
      const res = await run(authClient, options);
      expect(authClient.transactionManager.clear).toHaveBeenCalledWith();
      expect(res instanceof AuthTransaction).toBe(true);
      expect(res).toEqual({
        'data': {
          'nextStep': 'remediate-nextStep',
          'status': 1,
          'terminal': true,
          'tokens': null,
        },
        'nextStep': 'remediate-nextStep',
        'status': 1,
        'terminal': true,
        'tokens': null,
      });
    });
  });

  describe('response contains interactionCode', () => {
    beforeEach(() => {
      testContext.remediateResponse.idxResponse.interactionCode = 'idx-interactionCode';
    });

    it('calls exchangeCodeForTokens and returns tokens', async () => {
      const { authClient, options, tokenResponse } = testContext;

      jest.spyOn(authClient.transactionManager, 'load');
      jest.spyOn(authClient.transactionManager, 'clear');
      jest.spyOn(authClient.token, 'exchangeCodeForTokens');


      const res = await run(authClient, options);
      expect(authClient.transactionManager.load).toHaveBeenCalledWith();
      expect(authClient.transactionManager.clear).not.toHaveBeenCalledWith();
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        'clientId': 'meta-clientId',
        'codeVerifier': 'meta-code',
        'ignoreSignature': true,
        'interactionCode': 'idx-interactionCode',
        'redirectUri': 'meta-redirectUri',
        'scopes': [
          'meta',
        ],
      },
      {
        'authorizeUrl': 'meta-authorizeUrl'
      });

      expect(res instanceof AuthTransaction).toBe(true);
      expect(res).toEqual({
        'data': {
         'nextStep': 'remediate-nextStep',
         'status': 0,
         'terminal': false,
         'tokens': tokenResponse.tokens,
       },
       'nextStep': 'remediate-nextStep',
       'status': 0,
       'terminal': false,
       'tokens': tokenResponse.tokens,
      });
    });

    it('catches errors from exchangeCodeForTokens and clears storage', async () => {
      const { authClient, options } = testContext;
      const error = new Error('threw an error');

      jest.spyOn(authClient.transactionManager, 'load');
      jest.spyOn(authClient.transactionManager, 'clear');
      jest.spyOn(authClient.token, 'exchangeCodeForTokens').mockImplementation(async () => {
        throw error;
      });

      const res = await run(authClient, options);
      expect(authClient.transactionManager.load).toHaveBeenCalledWith();
      expect(authClient.transactionManager.clear).toHaveBeenCalledWith();
      expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({
        'clientId': 'meta-clientId',
        'codeVerifier': 'meta-code',
        'ignoreSignature': true,
        'interactionCode': 'idx-interactionCode',
        'redirectUri': 'meta-redirectUri',
        'scopes': [
          'meta',
        ],
      },
      {
        'authorizeUrl': 'meta-authorizeUrl'
      });

      expect(res instanceof AuthTransaction).toBe(true);
      expect(res).toEqual({
        'data': {
          error,
         'nextStep': 'remediate-nextStep',
         'status': 2,
         'terminal': false,
         'tokens': null,
       },
       'error': {},
       'nextStep': 'remediate-nextStep',
       'status': 2,
       'terminal': false,
       'tokens': null,
      });
    });
  });
});