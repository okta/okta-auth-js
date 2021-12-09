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


import { AuthSdkError } from '../../../lib';
import { canProceed, proceed } from '../../../lib/idx/proceed';

const mocked = {
  transactionMeta: require('../../../lib/idx/transactionMeta'),
  FlowSpecification: require('../../../lib/idx/flow/FlowSpecification'),
  run: require('../../../lib/idx/run')
};

describe('idx/proceed', () => {
  let testContext;

  beforeEach(() => {
    const stateHandle = 'test-stateHandle';
    const issuer = 'test-issuer';
    const clientId = 'test-clientId';
    const redirectUri = 'test-redirectUri';
    const transactionMeta = {
      flow: 'meta-flow',
      issuer,
      clientId,
      redirectUri,
      state: 'meta-state',
      codeVerifier: 'meta-code',
      scopes: ['meta'],
      urls: { authorizeUrl: 'meta-authorizeUrl' },
      ignoreSignature: true,
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
        clearIdxResponse: () => {}
      },
      idx: {
        setFlow: () => {}
      }
    };

    testContext = {
      issuer,
      clientId,
      redirectUri,
      stateHandle,
      transactionMeta,
      authClient
    };
  });

  describe('canProceed', () => {
    it('returns true if there is a saved transaction', () => {
      const { authClient, transactionMeta } = testContext;
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
      expect(canProceed(authClient)).toBe(true);
    });
    it('returns false if there is no saved transaction', () => {
      const { authClient } = testContext;
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(undefined);
      expect(canProceed(authClient)).toBe(false);
    });
  });

  describe('proceed', () => {
    beforeEach(() => {
      const flowSpec = {
        flow: 'fake',
        remediators: [],
      };
      jest.spyOn(mocked.FlowSpecification, 'getFlowSpecification').mockReturnValue(flowSpec);
      jest.spyOn(mocked.run, 'run').mockReturnValue(undefined);
      Object.assign(testContext, {
        flowSpec
      });
    });

    it('retrieves saved meta', async () => {
      const { authClient, transactionMeta, flowSpec } = testContext;
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
      await proceed(authClient);
      expect(mocked.transactionMeta.getSavedTransactionMeta).toHaveBeenCalledWith(authClient, {});
      expect(mocked.run.run).toHaveBeenCalledWith(authClient, {
        ...flowSpec
      });
    });

    it('retrieves saved meta using state, if provided', async () => {
      const { authClient, transactionMeta, flowSpec } = testContext;
      jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
      const state = 'foo';
      await proceed(authClient, { state });
      expect(mocked.transactionMeta.getSavedTransactionMeta).toHaveBeenCalledWith(authClient, { state });
      expect(mocked.run.run).toHaveBeenCalledWith(authClient, {
        ...flowSpec,
        state
      });
    });

    describe('no saved meta', () => {
      beforeEach(() => {
        jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(undefined);
      });
      it('by default, throws an error', async () => {
        const { authClient } = testContext;
        await expect(proceed(authClient)).rejects.toThrowError(new AuthSdkError('Unable to proceed: saved transaction could not be loaded'));
      });
      it('does not throw if stateTokenExternalId is passed', async () => {
        const { authClient, flowSpec } = testContext;
        const stateTokenExternalId = 'foo';
        await proceed(authClient, { stateTokenExternalId });
        expect(mocked.run.run).toHaveBeenCalledWith(authClient, {
          ...flowSpec,
          stateTokenExternalId
        });
      });
    });

    describe('with saved meta', () => {
      beforeEach(() => {
        const { transactionMeta } = testContext;
        jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(transactionMeta);
      });

      it('retrieves flow specification based on saved meta flow', async () => {
        const { authClient } = testContext;
        await proceed(authClient);
        expect(mocked.FlowSpecification.getFlowSpecification).toHaveBeenCalledWith(authClient, 'meta-flow');
      });

      it('calls run, passing along the flowSpec and any options', async () => {
        const { authClient, flowSpec } = testContext;
        const options = { state: 'bar' };
        await proceed(authClient, options);
        expect(mocked.run.run).toHaveBeenCalledWith(authClient, {
          ...flowSpec,
          ...options
        });
      });
    });

  });

});
