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


import { run } from '../../../lib/idx/run';
import { IdxStatus } from '../../../lib/idx/types';
import { IdxResponseFactory } from '@okta/test.support/idx';
import { AuthSdkError } from '../../../lib/errors';

jest.mock('../../../lib/idx/transactionMeta', () => {
  return {
    getSavedTransactionMeta: () => {}
  };
});

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
  remediate: require('../../../lib/idx/remediate'),
  transactionMeta: require('../../../lib/idx/transactionMeta')
};

describe('idx/run', () => {
  let testContext;
  beforeEach(() => {
    const transactionMeta = {
      state: 'meta-state',
      codeVerifier: 'meta-code',
      clientId: 'meta-clientId',
      redirectUri: 'meta-redirectUri',
      scopes: ['meta'],
      urls: { authorizeUrl: 'meta-authorizeUrl' },
      ignoreSignature: true
    };
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({ 
      meta: transactionMeta,
      interactionHandle: 'meta-interactionHandle',
      state: transactionMeta.state
    });

    const idxResponse = IdxResponseFactory.build();
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);

    const remediateResponse = {
      idxResponse,
      nextStep: 'remediate-nextStep',
      messages: undefined,
      terminal: false
    };
    jest.spyOn(mocked.remediate, 'remediate').mockResolvedValue(remediateResponse);

    const tokenResponse = {
      tokens: {
        fakeToken: true
      }
    };
    const authClient = {
      transactionManager: {
        load: () => transactionMeta,
        clear: () => {},
        saveIdxResponse: () => {}
      },
      token: {
        exchangeCodeForTokens: () => Promise.resolve(tokenResponse)
      },
      options: {}
    };
    const options = {
      flow: {
        'fake': true
      },
      actions: [],
      flowMonitor: {
        isFinished: jest.fn().mockResolvedValue(true)
      }
    };
    testContext = {
      idxResponse,
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
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      status: IdxStatus.PENDING,
      nextStep: 'remediate-nextStep',
    });
  });

  it('calls interact, passing options through', async () => {
    const { authClient, options } = testContext;
    await run(authClient, options);
    expect(mocked.interact.interact).toHaveBeenCalledWith(authClient, options);
  });

  it('calls introspect with interactionHandle', async () => {
    const { authClient, options } = testContext;
    await run(authClient, options);
    expect(mocked.introspect.introspect).toHaveBeenCalledWith(authClient, { 
      interactionHandle: 'meta-interactionHandle'
    });
  });

  it('calls remediate, passing options and values through', async () => {
    const { authClient, options, idxResponse } = testContext;
    const values = { 
      ...options, 
      stateHandle: idxResponse.rawIdxState.stateHandle 
    };
    await run(authClient, options);
    expect(mocked.remediate.remediate).toHaveBeenCalledWith(idxResponse, values, options);
  });

  it('saves idxResponse when nextStep is avaiable', async () => {
    const { authClient, options, idxResponse, remediateResponse } = testContext;
    remediateResponse.nextStep = 'has-next-step';
    jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
    await run(authClient, options);
    expect(authClient.transactionManager.saveIdxResponse).toHaveBeenCalledWith(idxResponse.rawIdxState);
  });

  it('returns messages in transaction', async () => {
    testContext.remediateResponse.messages = ['remediate-message-1'];
    const { authClient, options } = testContext;
    const res = await run(authClient, options);
    expect(res).toEqual({
      _idxResponse: expect.any(Object),
      messages: ['remediate-message-1'],
      nextStep: 'remediate-nextStep',
      status: IdxStatus.PENDING,
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        nextStep: 'remediate-nextStep',
        status: IdxStatus.PENDING,
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
      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        nextStep: 'remediate-nextStep',
        status: IdxStatus.TERMINAL,
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

      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        nextStep: 'remediate-nextStep',
        status: IdxStatus.SUCCESS,
        tokens: tokenResponse.tokens,
      });
    });

    it('catches error when the flow not suppose to be finished', async () => {
      const { authClient, options } = testContext; 
      options.flowMonitor = {
        isFinished: jest.fn().mockResolvedValue(false)
      };

      jest.spyOn(authClient.transactionManager, 'load');
      jest.spyOn(authClient.transactionManager, 'clear');
      jest.spyOn(authClient.token, 'exchangeCodeForTokens');

      const res = await run(authClient, options);
      expect(authClient.transactionManager.clear).toHaveBeenCalledWith();
      expect(authClient.token.exchangeCodeForTokens).not.toHaveBeenCalledWith();
      expect(res.status).toEqual(IdxStatus.FAILURE);
      expect(res.error instanceof AuthSdkError).toBeTruthy();
      expect((res.error as AuthSdkError).message).toEqual('Current flow is not supported, check policy settings in your org.');
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

      expect(res).toEqual({
        _idxResponse: expect.any(Object),
        error,
        nextStep: 'remediate-nextStep',
        status: IdxStatus.FAILURE,
      });
    });
  });

  describe('with stateTokenExternalId', () => {
    describe('with saved interaction handle', () => {
      beforeEach(() => {
        const { transactionMeta } = testContext;
        transactionMeta.interactionHandle = 'meta-interactionHandle';
        jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
      });
      it('calls introspect with stateTokenExternalId and interactionHandle', async () => {
        const { authClient, options } = testContext;
        options.stateTokenExternalId = 'abc';
        await run(authClient, options);
        expect(mocked.introspect.introspect).toHaveBeenCalledWith(authClient, { 
          interactionHandle: 'meta-interactionHandle',
          stateTokenExternalId: 'abc'
        });
      });
      it('passes `state` option to `getSavedTransactionMeta()`', async () => {
        const { authClient, options } = testContext;
        options.stateTokenExternalId = 'abc';
        options.state = 'def';
        await run(authClient, options);
        expect(mocked.transactionMeta.getSavedTransactionMeta).toHaveBeenCalledWith(authClient, { 
          state: 'def'
        });
      });
    });
    describe('without saved interaction handle', () => {
      beforeEach(() => {
        jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(undefined);
      });
      it('calls introspect with stateTokenExternalId and no interactionHandle', async () => {
        const { authClient, options } = testContext;
        options.stateTokenExternalId = 'abc';
        await run(authClient, options);
        expect(mocked.introspect.introspect).toHaveBeenCalledWith(authClient, { 
          stateTokenExternalId: 'abc'
        });
      });
    });
  });
});