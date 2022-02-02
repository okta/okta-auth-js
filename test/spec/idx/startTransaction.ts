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


import { startTransaction } from '../../../lib/idx/startTransaction';
import { IdxFeature, IdxStatus } from '../../../lib/idx/types';

import { 
  IdxResponseFactory,
  SelectEnrollProfileRemediationFactory,
  RedirectIdpRemediationFactory,
  IdentifyRemediationFactory
} from '@okta/test.support/idx';

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
  remediate: require('../../../lib/idx/remediate'),
  transactionMeta: require('../../../lib/idx/transactionMeta')
};

describe('idx/startTransaction', () => {
  let testContext;

  beforeEach(() => {
    const stateHandle = 'test-stateHandle';

    const issuer = 'test-issuer';
    const clientId = 'test-clientId';
    const redirectUri = 'test-redirectUri';
    const transactionMeta = {
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
        clearIdxResponse: () => {},
        saveIdxResponse: () => {}
      },
      idx: {
        getFlow: () => {},
        setFlow: () => {}
      },
      token: {
        exchangeCodeForTokens: () => {}
      }
    };

    const idxResponse = IdxResponseFactory.build({
      neededToProceed: [
        IdentifyRemediationFactory.build(),
      ]
    });
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({
      meta: transactionMeta,
      interactionHandle: 'meta-interactionHandle',
      state: transactionMeta.state
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    jest.spyOn(mocked.remediate, 'remediate').mockResolvedValue({ idxResponse });
    jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockReturnValue(undefined);
    testContext = {
      issuer,
      clientId,
      redirectUri,
      stateHandle,
      transactionMeta,
      authClient,
      idxResponse
    };
  });

  it('calls interact, introspect, and remediate', async () => {
    const { authClient, idxResponse } = testContext;
    await startTransaction(authClient);
    expect(mocked.interact.interact).toHaveBeenCalledWith(authClient, { withCredentials: true });
    expect(mocked.introspect.introspect).toHaveBeenCalledWith(authClient, { 
      withCredentials: true,
      interactionHandle: 'meta-interactionHandle' 
    });
    expect(mocked.remediate.remediate).toHaveBeenCalledWith(
      // IDX response
      idxResponse,
      // values
      {
        exchangeCodeForTokens: false,
        stateHandle: 'unknown-stateHandle'
      },
      // flowMonitor
      expect.any(Object)
    );
  });

  it('does not attempt to exchange code for tokens', async () => {
    const { authClient, idxResponse } = testContext;
    idxResponse.interactionCode = 'fake';
    jest.spyOn(authClient.token, 'exchangeCodeForTokens');
    await startTransaction(authClient);
    expect(authClient.token.exchangeCodeForTokens).not.toHaveBeenCalled();
  });

  describe('response', () => {
    it('returns a transaction object', async () => {
      const { authClient, idxResponse, transactionMeta } = testContext;
      const res = await startTransaction(authClient);
      expect(res).toEqual(Object.assign({}, idxResponse, {
        status: 'PENDING',
        availableSteps: [{
          inputs: [{
            label: 'Username',
            name: 'username'
          }],
          name: 'identify'
        }],
        enabledFeatures: [],
        meta: transactionMeta,
        toPersist: undefined
      }));
    });
    it('exposes transaction meta in the response', async () => {
      const { authClient, transactionMeta } = testContext;
      const res = await startTransaction(authClient);
      expect(res.meta).toEqual(transactionMeta);
    });
  
    it('if there is no interactionCode on the response, returns transaction in pending status', async () => {
      const { authClient } = testContext;
      const res = await startTransaction(authClient);
      expect(res.status).toEqual(IdxStatus.PENDING);
    });

    it('if there is an interactionCode on the response, returns transaction with status=SUCCESS', async () => {
      const { authClient, idxResponse } = testContext;
      idxResponse.interactionCode = 'fake';
  
      const res = await startTransaction(authClient);
      expect(res.status).toEqual(IdxStatus.SUCCESS);
    });

  });


  it('has password-recovery feature enabled with currentAuthenticator-recover action', async () => {
    const idxResponse = IdxResponseFactory.build({
      actions: { 
        'currentAuthenticator-recover': (() => {}) as Function
      }
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    jest.spyOn(mocked.remediate, 'remediate').mockResolvedValue({ idxResponse });
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures!.includes(IdxFeature.PASSWORD_RECOVERY)).toBeTruthy();
  });

  it('has registration feature enabled with RegistrationEnabledResponseFactory', async () => {
    const idxResponse = IdxResponseFactory.build({
      neededToProceed: [
        SelectEnrollProfileRemediationFactory.build()
      ]
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    jest.spyOn(mocked.remediate, 'remediate').mockResolvedValue({ idxResponse });
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures!.includes(IdxFeature.REGISTRATION)).toBeTruthy();
  });

  it('has social idp feature enabled with SocialIDPEnabledResponseFactory', async () => {
    const idxResponse = IdxResponseFactory.build({
      neededToProceed: [
        RedirectIdpRemediationFactory.build()
      ]
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    jest.spyOn(mocked.remediate, 'remediate').mockResolvedValue({ idxResponse });
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures!.includes(IdxFeature.SOCIAL_IDP)).toBeTruthy();
  });

  it('maps remediations to availableSteps', async () => {
    const idxResponse = IdxResponseFactory.build({
      neededToProceed: [
        IdentifyRemediationFactory.build(),
        SelectEnrollProfileRemediationFactory.build()
      ]
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    jest.spyOn(mocked.remediate, 'remediate').mockResolvedValue({ idxResponse });
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.availableSteps).toEqual([
      {
        inputs: [
          { label: 'Username', name: 'username' }
        ], 
        name: 'identify'
      }, 
      {
        inputs: [], 
        name: 'select-enroll-profile'
      }
    ]);
  });

});
