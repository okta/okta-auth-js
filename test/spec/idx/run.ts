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
import { AuthenticationOptions, IdxStatus } from '../../../lib/idx/types';
import { IdxResponseFactory, IdentifyRemediationFactory } from '@okta/test.support/idx';

jest.mock('../../../lib/idx/transactionMeta', () => {
  return {
    getSavedTransactionMeta: () => {},
    saveTransactionMeta: () => {}
  };
});

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
  remediate: require('../../../lib/idx/remediate'),
  transactionMeta: require('../../../lib/idx/transactionMeta'),
  FlowSpecification: require('../../../lib/idx/flow/FlowSpecification')
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

    const stateHandle = 'abc';
    const idxResponse = IdxResponseFactory.build({
      neededToProceed: [
        IdentifyRemediationFactory.build(),
      ],
      requestDidSucceed: true,
      context: { stateHandle }
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);

    const remediateResponse = {
      idxResponse,
      nextStep: 'remediate-nextStep'
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
        saveIdxResponse: () => {},
      },
      token: {
        exchangeCodeForTokens: () => Promise.resolve(tokenResponse)
      },
      options: {},
      idx: {
        setFlow: () => {},
        getFlow: () => {}
      }
    };

    const interactOptions = {
      withCredentials: false,
      state: 'abc',
      scopes: ['fooboo']
    };
    testContext = {
      idxResponse,
      remediateResponse,
      tokenResponse,
      transactionMeta,
      authClient,
      interactOptions
    };
  });

  describe('with stateHandle', () => {
    it('will call introspect', async () => {
      const { authClient } = testContext;
      const stateHandle = 'abc';
      await run(authClient, { stateHandle });
      expect(mocked.introspect.introspect).toHaveBeenCalledWith(authClient, {
        withCredentials: true,
        stateHandle
      });
    });

    it('does not call interact', async () => {
      const { authClient } = testContext;
      const stateHandle = 'abc';
      await run(authClient, { stateHandle });
      expect(mocked.interact.interact).not.toHaveBeenCalled();
    });

    it('will preserve transaction meta, if it exists', async () => {
      const { authClient, transactionMeta } = testContext;
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
      jest.spyOn(mocked.transactionMeta, 'saveTransactionMeta');
      const stateHandle = 'abc';
      await run(authClient, { stateHandle });
      expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, transactionMeta);
    });
  });

  describe('flow', () => {
    it('if not specified or already set, sets the flow to "default"', async () => {
      const { authClient } = testContext;
      jest.spyOn(authClient.idx, 'setFlow');
      await run(authClient);
      expect(authClient.idx.setFlow).toHaveBeenCalledWith('default');
    });
  
    it('if flow is set in run options, it sets the flow on the authClient', async () => {
      const { authClient } = testContext;
      const flow = 'signup';
      jest.spyOn(authClient.idx, 'setFlow');
      await run(authClient, { flow });
      expect(authClient.idx.setFlow).toHaveBeenCalledWith(flow);
    });

    it('if flow is not set in run options, it respects the flow already set on auth client', async () => {
      const { authClient } = testContext;
      jest.spyOn(authClient.idx, 'getFlow').mockReturnValue('existing');
      jest.spyOn(authClient.idx, 'setFlow');
      await run(authClient);
      expect(authClient.idx.setFlow).toHaveBeenCalledWith('existing');
    });

    it('retrieves flow specification based on flow option', async () => {
      const { authClient } = testContext;
      jest.spyOn(mocked.FlowSpecification, 'getFlowSpecification');
      await run(authClient, { flow: 'signup' });
      expect(mocked.FlowSpecification.getFlowSpecification).toHaveBeenCalledWith(authClient, 'signup');
    });
  });

  describe('with saved transaction', () => {
    beforeEach(() => {
      const { transactionMeta } = testContext;
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
    });
    it('if saved meta has no interactionHandle, will call interact', async () => {
      const { authClient } = testContext;
      await run(authClient);
      expect(mocked.interact.interact).toHaveBeenCalled();
    });
    it('if saved meta has interactionHandle, does not call interact', async () => {
      const { authClient, transactionMeta } = testContext;
      transactionMeta.interactionHandle = 'fake';
      await run(authClient);
      expect(mocked.interact.interact).not.toHaveBeenCalled();
    });
  });

  describe('no saved transaction', () => {
    beforeEach(() => {
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(undefined);
    });
    it('clears saved transaction data and calls interact', async () => {
      const { authClient } = testContext;
      jest.spyOn(authClient.transactionManager, 'clear');
      await run(authClient);
      expect(authClient.transactionManager.clear).toHaveBeenCalledTimes(1);
      expect(mocked.interact.interact).toHaveBeenCalled();
    });
  });

  it('returns transaction', async () => {
    const { authClient } = testContext;
    const res = await run(authClient);
    expect(res).toMatchObject({
      status: IdxStatus.PENDING,
      nextStep: 'remediate-nextStep',
      requestDidSucceed: true
    });
  });

  it('calls interact, passing options through', async () => {
    const { authClient, interactOptions } = testContext;
    await run(authClient, interactOptions);
    expect(mocked.interact.interact).toHaveBeenCalledWith(authClient, interactOptions);
  });

  it('calls introspect with interactionHandle', async () => {
    const { authClient } = testContext;
    await run(authClient);
    expect(mocked.introspect.introspect).toHaveBeenCalledWith(authClient, { 
      withCredentials: true,
      interactionHandle: 'meta-interactionHandle'
    });
  });

  it('calls remediate, passing options and values through', async () => {
    const { authClient, idxResponse } = testContext;
    const flow = 'register';
    const username = 'x';
    const password = 'y';
    const shouldProceedWithEmailAuthenticator = false;
    const options: AuthenticationOptions = {
      username,
      password,
      flow,
      shouldProceedWithEmailAuthenticator // will be removed in next major version
    };
    const values = { 
      username,
      password, 
      stateHandle: idxResponse.rawIdxState.stateHandle 
    };
    const flowSpec = mocked.FlowSpecification.getFlowSpecification(authClient, flow);
    const { remediators, actions, flowMonitor } = flowSpec;
    await run(authClient, options);
    expect(mocked.remediate.remediate).toHaveBeenCalledWith(idxResponse, values, {
      remediators,
      actions,
      flow,
      flowMonitor,
      shouldProceedWithEmailAuthenticator // will be removed in next major version
    });
  });

  it('saves idxResponse when nextStep is avaiable', async () => {
    const { authClient, idxResponse, remediateResponse } = testContext;
    remediateResponse.nextStep = 'has-next-step';
    jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
    await run(authClient);
    expect(authClient.transactionManager.saveIdxResponse).toHaveBeenCalledWith({
      rawIdxResponse: idxResponse.rawIdxState,
      requestDidSucceed: true,
      stateHandle: idxResponse.context.stateHandle
    });
  });

  it('saves idxResponse with interactionHandle if available', async () => {
    const { authClient, idxResponse, remediateResponse, transactionMeta } = testContext;
    transactionMeta.interactionHandle = '1234';
    remediateResponse.nextStep = 'has-next-step';
    jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
    await run(authClient);
    expect(authClient.transactionManager.saveIdxResponse).toHaveBeenCalledWith({
      rawIdxResponse: idxResponse.rawIdxState,
      requestDidSucceed: true,
      stateHandle: idxResponse.context.stateHandle,
      interactionHandle: transactionMeta.interactionHandle
    });
  });

  it('returns messages in transaction', async () => {
    testContext.idxResponse.rawIdxState.messages = {
      value: ['remediate-message-1']
    };
    const { authClient } = testContext;
    const res = await run(authClient);
    expect(res).toMatchObject({
      messages: ['remediate-message-1'],
      nextStep: 'remediate-nextStep',
      status: IdxStatus.PENDING,
    });
  });

  describe('response is not terminal', () => {
    beforeEach(() => {
      const { transactionMeta } = testContext;
      // load from saved transaction
      transactionMeta.interactionHandle = 'fake';
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
    });

    describe('requestDidSucceed = true', () => {
      it('does not clear transaction storage', async () => {
        const { authClient } = testContext;
        jest.spyOn(authClient.transactionManager, 'clear');
        const res = await run(authClient);
        expect(authClient.transactionManager.clear).not.toHaveBeenCalledWith();
        expect(res).toMatchObject({
          nextStep: 'remediate-nextStep',
          status: IdxStatus.PENDING,
        });
      });
  
      it('saves `state` in transaction meta', async () => {
        const { authClient, transactionMeta } = testContext;
        jest.spyOn(mocked.transactionMeta, 'saveTransactionMeta');
        await run(authClient);
        expect(mocked.transactionMeta.saveTransactionMeta).toHaveBeenCalledWith(authClient, transactionMeta);
      });
  
      it('saves idxResponse', async () => {
        const { authClient, idxResponse, transactionMeta } = testContext;
        jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
        await run(authClient);
        expect(authClient.transactionManager.saveIdxResponse).toHaveBeenCalledWith({
          rawIdxResponse: idxResponse.rawIdxState,
          requestDidSucceed: true,
          stateHandle: idxResponse.context.stateHandle,
          interactionHandle: transactionMeta.interactionHandle
        });
      });
    });

    describe('requestDidSucceed = false', () =>{
      beforeEach(() => {
        const { idxResponse } = testContext;
        idxResponse.requestDidSucceed = false;
      });
  
      // Do not save the failed response. Use previous saved IDX resposne to continue
      it('does not save the idxResponse', async () =>{
        const { authClient, idxResponse } = testContext;
        idxResponse.requestDidSucceed = false;
        jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
        await run(authClient);
        expect(authClient.transactionManager.saveIdxResponse).not.toHaveBeenCalled();
      });
  
      // an error response does not clear the transaction. options may be valid on previous response
      it('does not clear the last transaction or idx response', async () => {
        const { authClient } = testContext;
        jest.spyOn(authClient.transactionManager, 'clear');
        const res = await run(authClient);
        expect(res).toMatchObject({
          nextStep: 'remediate-nextStep',
          status: IdxStatus.PENDING,
        });
        expect(authClient.transactionManager.clear).not.toHaveBeenCalled();
      });

      // Special case of an error response that can be continued
      it('does save the idxResponse if stepUp is true', async () =>{
        const { authClient, idxResponse, transactionMeta } = testContext;
        idxResponse.requestDidSucceed = false;
        idxResponse.stepUp = true;
        jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
        await run(authClient);
        expect(authClient.transactionManager.saveIdxResponse).toHaveBeenCalledWith({
          rawIdxResponse: idxResponse.rawIdxState,
          requestDidSucceed: false,
          stateHandle: idxResponse.context.stateHandle,
          interactionHandle: transactionMeta.interactionHandle
        });
      });
    });
  });

  // terminal can be error or non-error
  describe('response is terminal', () => {
    beforeEach(() => {
      const { idxResponse, transactionMeta } = testContext;
      idxResponse.neededToProceed = [];
      // load from saved transaction
      transactionMeta.interactionHandle = 'fake';
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
    });

    describe('requestDidSucceed = true', () => {

      describe('no actions, no messages', () => {
        // a terminal success is the end of the transaction. there are no more options for the user.
        it('clears transaction storage and last idx reponse', async () => {
          const { authClient } = testContext;
          jest.spyOn(authClient.transactionManager, 'clear');
          const res = await run(authClient);
          expect(res).toMatchObject({
            nextStep: 'remediate-nextStep',
            status: IdxStatus.TERMINAL,
          });
          expect(authClient.transactionManager.clear).toHaveBeenCalledTimes(1);
          expect(authClient.transactionManager.clear).toHaveBeenNthCalledWith(1, { clearSharedStorage: false });
        });
        // terminal response is not saved, everything should be cleared
        it('does not save the idxResponse', async () =>{
          const { authClient } = testContext;
          jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
          await run(authClient);
          expect(authClient.transactionManager.saveIdxResponse).not.toHaveBeenCalled();
        });
      });

      describe('no actions, has info messages', () => {
        // a terminal response with no actions and only info messages is considered a success state
        beforeEach(() => {
          const { idxResponse } = testContext;
          idxResponse.rawIdxState.messages = {
            value: [{
              message: 'foo',
              class: 'INFO'
            }]
          };
        });
        it('clears transaction storage and last idx reponse', async () => {
          const { authClient } = testContext;
          jest.spyOn(authClient.transactionManager, 'clear');
          const res = await run(authClient);
          expect(res).toMatchObject({
            nextStep: 'remediate-nextStep',
            status: IdxStatus.TERMINAL,
          });
          expect(authClient.transactionManager.clear).toHaveBeenCalledTimes(1);
          expect(authClient.transactionManager.clear).toHaveBeenNthCalledWith(1, { clearSharedStorage: false });
        });
        // terminal response is not saved, everything should be cleared
        it('does not save the idxResponse', async () =>{
          const { authClient } = testContext;
          jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
          await run(authClient);
          expect(authClient.transactionManager.saveIdxResponse).not.toHaveBeenCalled();
        });
      });

      describe('no actions, has error messages', () => {
        // a terminal response with error messages should not be saved.
        // However the transaction is not cleared either as the previous response may have available actions
        beforeEach(() => {
          const { idxResponse } = testContext;
          idxResponse.rawIdxState.messages = {
            value: [{
              message: 'foo',
              class: 'ERROR'
            }]
          };
        });

        // leave previous response in place. This response may only contain an error message.
        it('does not clear the last transaction or idx response', async () => {
          const { authClient } = testContext;
          jest.spyOn(authClient.transactionManager, 'clear');
          const res = await run(authClient);
          expect(res).toMatchObject({
            nextStep: 'remediate-nextStep',
            status: IdxStatus.TERMINAL,
          });
          expect(authClient.transactionManager.clear).not.toHaveBeenCalled();
        });

        it('does not save the idxResponse', async () =>{
          const { authClient } = testContext;
          jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
          await run(authClient);
          expect(authClient.transactionManager.saveIdxResponse).not.toHaveBeenCalled();
        });

      });

      describe('has actions, no messages', () => {
        // a terminal response with available actions behaves similar to a pending status. it does not clear the transaction.
        beforeEach(() => {
          const { idxResponse } = testContext;
          idxResponse.actions = {
            cancel: () => {}
          };
        });

        it('does not clear the last transaction or idx response', async () => {
          const { authClient } = testContext;
          jest.spyOn(authClient.transactionManager, 'clear');
          const res = await run(authClient);
          expect(res).toMatchObject({
            nextStep: 'remediate-nextStep',
            status: IdxStatus.TERMINAL,
          });
          expect(authClient.transactionManager.clear).not.toHaveBeenCalled();
        });

        // actions are available. save the IDX response so they can be used.
        it('does save the idxResponse', async () =>{
          const { authClient, idxResponse, transactionMeta } = testContext;
          jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
          await run(authClient);
          expect(authClient.transactionManager.saveIdxResponse).toHaveBeenCalledWith({
            rawIdxResponse: idxResponse.rawIdxState,
            requestDidSucceed: true,
            stateHandle: idxResponse.context.stateHandle,
            interactionHandle: transactionMeta.interactionHandle
          });
        });
      });

      describe('has actions, error messages', () => {
        // a terminal response with available actions behaves similar to a pending status. it does not clear the transaction.
        beforeEach(() => {
          const { idxResponse } = testContext;
          idxResponse.actions = {
            cancel: () => {}
          };
          idxResponse.rawIdxState.messages = {
            value: [{
              message: 'foo',
              class: 'ERROR'
            }]
          };
        });

        it('does not clear the last transaction or idx response', async () => {
          const { authClient } = testContext;
          jest.spyOn(authClient.transactionManager, 'clear');
          const res = await run(authClient);
          expect(res).toMatchObject({
            nextStep: 'remediate-nextStep',
            status: IdxStatus.TERMINAL,
          });
          expect(authClient.transactionManager.clear).not.toHaveBeenCalled();
        });

        // actions are available. save the IDX response so they can be used.
        it('does save the idxResponse', async () =>{
          const { authClient, idxResponse, transactionMeta } = testContext;
          jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
          await run(authClient);
          expect(authClient.transactionManager.saveIdxResponse).toHaveBeenCalledWith({
            rawIdxResponse: idxResponse.rawIdxState,
            requestDidSucceed: true,
            stateHandle: idxResponse.context.stateHandle,
            interactionHandle: transactionMeta.interactionHandle
          });
        });
      });
    });

    describe('requestDidSucceed = false', () => {
      beforeEach(() => {
        const { idxResponse } = testContext;
        idxResponse.requestDidSucceed = false;
      });
      // a terminal error does not clear the transaction. cancel/skip may be valid on previous response
      it('does not clear the last transaction or idx response', async () => {
        const { authClient } = testContext;
        jest.spyOn(authClient.transactionManager, 'clear');
        const res = await run(authClient);
        expect(res).toMatchObject({
          nextStep: 'remediate-nextStep',
          status: IdxStatus.TERMINAL,
        });
        expect(authClient.transactionManager.clear).not.toHaveBeenCalled();
      });
      // a terminal error response is not saved. previous idxResponse may be used to cancel/skip
      it('does not save the idxResponse', async () =>{
        const { authClient } = testContext;
        jest.spyOn(authClient.transactionManager, 'saveIdxResponse');
        await run(authClient);
        expect(authClient.transactionManager.saveIdxResponse).not.toHaveBeenCalled();
      });
    });
  });

  describe('response contains interactionCode', () => {
    beforeEach(() => {
      testContext.idxResponse.interactionCode = 'idx-interactionCode';
    });

    it('calls exchangeCodeForTokens and returns tokens', async () => {
      const { authClient, tokenResponse } = testContext;

      jest.spyOn(authClient.transactionManager, 'load');
      jest.spyOn(authClient.transactionManager, 'clear');
      jest.spyOn(authClient.token, 'exchangeCodeForTokens');

      const res = await run(authClient);
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

      expect(res).toMatchObject({
        nextStep: 'remediate-nextStep',
        status: IdxStatus.SUCCESS,
        tokens: tokenResponse.tokens,
      });
    });

    it('throws errors from exchangeCodeForTokens', async () => {
      const { authClient } = testContext;
      const error = new Error('threw an error');

      jest.spyOn(authClient.token, 'exchangeCodeForTokens').mockImplementation(async () => {
        throw error;
      });

      let didThrow = false;
      try {
        await run(authClient);
      } catch (e) {
        didThrow = true;
        expect(e).toEqual(error);
      }
      expect(didThrow).toBe(true);
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
    });
  });

});