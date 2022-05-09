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
  IdxErrorSessionExpiredFactory,
  IdxMessageCheckYourEmailFactory,
  IdxMessagesFactory,
  IdxResponseFactory,
  RawIdxResponseFactory
} from '@okta/test.support/idx';
import { poll } from '../../../lib/idx';
import { proceed } from '../../../lib/idx/proceed';
import { IdxStatus } from '../../../lib/idx/types';

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
  proceed: require('../../../lib/idx/proceed'),
  transactionMeta: require('../../../lib/idx/transactionMeta'),
  util: require('../../../lib/util/console')
};

describe('idx/poll', () => {
  let testContext;
  beforeEach(() => {
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
        loadIdxResponse: () => {},
      },
      token: {
        exchangeCodeForTokens: () => Promise.resolve(tokenResponse)
      },
      idx: {
        getFlow: () => {},
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
    });

    const enrollPollBackoff1Response = IdxResponseFactory.build({
      neededToProceed: [
        EnrollPollRemediationFactory.build({
          refresh: 200
        })
      ],
    });

    const enrollPollBackoff2Response = IdxResponseFactory.build({
      neededToProceed: [
        EnrollPollRemediationFactory.build({
          refresh: 400
        })
      ],
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

    const sessionExpiredResponse = IdxResponseFactory.build({
      requestDidSucceed: false,
      rawIdxState: RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxErrorSessionExpiredFactory.build()
          ]
        })
      })
    });

    testContext = {
      authClient,
      enrollPollResponse,
      enrollPollBackoff1Response,
      enrollPollBackoff2Response,
      successCheckEmailResponse,
      sessionExpiredResponse,
    };
  });

  it('performs single poll request by default (no polling options passed)', async () => {
    const {
      authClient,
      enrollPollResponse
    } = testContext;

    chainResponses([
      enrollPollResponse,
      enrollPollResponse,
    ]);

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
      .mockResolvedValueOnce(enrollPollResponse) // get nextStep
      .mockResolvedValueOnce(enrollPollResponse) // poll x3
      .mockResolvedValueOnce(enrollPollResponse)
      .mockResolvedValueOnce(enrollPollResponse)
      .mockResolvedValueOnce(successCheckEmailResponse);
    jest.spyOn(enrollPollResponse, 'proceed');

    const res = await proceed(authClient, {});
    const refresh = res.nextStep!.poll!.refresh;
    const transaction = await poll(authClient, { refresh });
    expect(enrollPollResponse.proceed).toHaveBeenCalledTimes(3);
    expect(transaction.status).toEqual(IdxStatus.TERMINAL);
  });

  it('uses refresh interval from poll response', async () => {
    const {
      authClient,
      enrollPollResponse,
      enrollPollBackoff1Response,
      enrollPollBackoff2Response,
      successCheckEmailResponse,
    } = testContext;

    chainResponses([
      enrollPollResponse,
      enrollPollBackoff1Response,
      enrollPollBackoff2Response,
      successCheckEmailResponse,
    ]);

    jest.spyOn(global, 'setTimeout');

    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(enrollPollResponse)
      .mockResolvedValueOnce(enrollPollBackoff1Response)
      .mockResolvedValueOnce(enrollPollBackoff2Response)
      .mockResolvedValueOnce(successCheckEmailResponse);

    await poll(authClient, { refresh: 100 });
    expect(setTimeout).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 400);
  });

  it('stops polling on IDX error response', async () => {
    const {
      authClient,
      enrollPollResponse,
      sessionExpiredResponse,
    } = testContext;

    chainResponses([
      enrollPollResponse,
      enrollPollResponse,
    ]);
    jest.spyOn(mocked.introspect, 'introspect')
      .mockResolvedValueOnce(enrollPollResponse)
      .mockResolvedValueOnce(sessionExpiredResponse);

    const transaction = await poll(authClient, { refresh: 100 });
    expect(transaction.status).toEqual(IdxStatus.TERMINAL);
  });

  it('propagates other errors', async () => {
    const {
      authClient
    } = testContext;

    jest.spyOn(mocked.transactionMeta, 'getSavedTransactionMeta').mockImplementationOnce(() => {
      throw new Error('Storage Error');
    });
    try {
      await poll(authClient, { refresh: 100 });
    } catch (err: any) {
      expect(err.message).toEqual('Storage Error');
    }
  });

  it('issues a warning when no polling remediations available', async () => {
    const {
      authClient,
      enrollPollResponse
    } = testContext;
    chainResponses([
      enrollPollResponse,
      enrollPollResponse,
    ]);
    jest.spyOn(mocked.introspect, 'introspect')
    .mockResolvedValueOnce(enrollPollResponse);
    jest.spyOn(mocked.util, 'warn');
    await poll(authClient);
    expect(mocked.util.warn).toHaveBeenCalledTimes(1);
  });
});
