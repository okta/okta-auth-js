/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { 
  chainResponses,
  EnrollPollRemediationFactory,
  IdxContextFactory, IdxMessageCheckYourEmailFactory, IdxMessagesFactory, IdxResponseFactory,
  OktaVerifyAuthenticatorWithContextualDataFactory,
  RawIdxResponseFactory
} from '@okta/test.support/idx';
import { poll } from '../../../lib/idx';
import { proceed } from '../../../lib/idx/proceed';
import { IdxStatus } from '../../../lib/idx/types';

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
  proceed: require('../../../lib/idx/proceed')
};



describe('idx/poll', () => {
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
      },
      idx: {
        setFlow: () => {}
      }
    };

    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({ 
      meta: transactionMeta,
      interactionHandle: 'meta-interactionHandle',
      state: transactionMeta.state
    });

    const enrollPollResponse = IdxResponseFactory.build({
      neededToProceed: [
        EnrollPollRemediationFactory.build()
      ],
      context: IdxContextFactory.build({
        currentAuthenticator: {
          value: OktaVerifyAuthenticatorWithContextualDataFactory.build()
        }
      }),
    });

    const successCheckEmailResponse = IdxResponseFactory.build({
      rawIdxState: RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxMessageCheckYourEmailFactory.build()
          ]
        })
      })
    });

    testContext = {
      authClient,
      enrollPollResponse,
      successCheckEmailResponse,
    };
  });

  it('performs single poll request by default (no polling options passed)', async () => {
    const {
      authClient,
      enrollPollResponse
    } = testContext;

    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValue(enrollPollResponse);
    jest.spyOn(mocked.proceed, 'proceed');

    await poll(authClient, {});
    expect(mocked.proceed.proceed).toHaveBeenCalledTimes(1);
  });

  it('polls until completion when refresh parameter is passed', async () => {
    const {
      authClient,
      enrollPollResponse,
      successCheckEmailResponse,
    } = testContext;

    chainResponses([
      enrollPollResponse,
      enrollPollResponse,
    ]);

    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(enrollPollResponse)
      .mockResolvedValueOnce(enrollPollResponse)
      .mockResolvedValueOnce(enrollPollResponse)
      .mockResolvedValueOnce(successCheckEmailResponse);
    jest.spyOn(enrollPollResponse, 'proceed');

    const { nextStep } = await proceed(authClient, {});
    const transaction = await poll(authClient, {refresh: nextStep.pollForResult.refresh});
    expect(enrollPollResponse.proceed).toHaveBeenCalledTimes(2);
    expect(transaction.status).toEqual(IdxStatus.TERMINAL);
  });

  it('rejects on session timeout', async () => {

  });

  it('rejects on other errors', async () => {

  });
});