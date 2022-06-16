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


import { handleInteractionCodeRedirect } from '../../../lib/idx/handleInteractionCodeRedirect';
import { Tokens, AuthSdkError, OAuthError } from '../../../lib';

import tokens from '@okta/test.support/tokens';

describe('idx/handleInteractionCodeRedirect', () => {
  let testContext;
  let transactionMeta;

  beforeEach(() => {
    const stateHandle = 'test-stateHandle';

    const issuer = 'test-issuer';
    const clientId = 'test-clientId';
    const redirectUri = 'test-redirectUri';
    transactionMeta = {
      issuer,
      clientId,
      redirectUri,
      state: 'meta-state',
      codeVerifier: 'meta-code',
      scopes: ['meta'],
      urls: { authorizeUrl: 'meta-authorizeUrl' },
      ignoreSignature: true
    };
    const mockTokens: Tokens = {
      idToken: tokens.standardIdTokenParsed
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
        save: () => {}
      },
      token: {
        exchangeCodeForTokens: jest.fn().mockImplementation(() => Promise.resolve({ tokens: mockTokens }))
      },
      tokenManager: {
        setTokens: jest.fn().mockImplementation(() => {})
      }
    };

    testContext = {
      issuer,
      clientId,
      redirectUri,
      stateHandle,
      transactionMeta,
      authClient,
      mockTokens
    };
  });

  it('calls exchangeCodeForToken and setTokens', async () => {
    const { authClient, mockTokens } = testContext;
    const url = 'http://localhost:8080/login/callback?state=meta-state&interaction_code=mockInteractionCode';
    await handleInteractionCodeRedirect(authClient, url);
    expect(authClient.token.exchangeCodeForTokens).toHaveBeenCalledWith({ 
      interactionCode: 'mockInteractionCode',
      codeVerifier: 'meta-code'
    });
    expect(authClient.tokenManager.setTokens).toHaveBeenCalledWith(mockTokens);
  });

  it('throws AuthSdkError when no meta in transactionManager', async () => {
    transactionMeta = null;
    const { authClient } = testContext;
    const url = 'http://localhost:8080/login/callback?state=meta-state&interaction_code=mockInteractionCode';
    try {
      await handleInteractionCodeRedirect(authClient, url);
    } catch (err) {
      expect(err).toBeInstanceOf(AuthSdkError);
      expect((err as AuthSdkError).message).toEqual('No transaction data was found in storage');
    }
  });

  it('throws AuthSdkError when state from url not match with transaction state', async () => {
    const { authClient } = testContext;
    const url = 'http://localhost:8080/login/callback?state=new-state&interaction_code=mockInteractionCode';
    try {
      await handleInteractionCodeRedirect(authClient, url);
    } catch (err) {
      expect(err).toBeInstanceOf(AuthSdkError);
      expect((err as AuthSdkError).message).toEqual('State in redirect uri does not match with transaction state');
    }
  });

  it('throws AuthSdkError when no interaction_code is available', async () => {
    const { authClient } = testContext;
    const url = 'http://localhost:8080/login/callback?state=meta-state';
    try {
      await handleInteractionCodeRedirect(authClient, url);
    } catch (err) {
      expect(err).toBeInstanceOf(AuthSdkError);
      expect((err as AuthSdkError).message).toEqual('Unable to parse interaction_code from the url');
    }
  });

  it('throws OAuthError error when "error_description" in url', async () => {
    const { authClient } = testContext;
    const url = 'http://localhost:8080/login/callback?error=fake_error&error_description=fake_error_description&state=meta-state';
    try {
      await handleInteractionCodeRedirect(authClient, url);
    } catch (err) {
      expect(err).toBeInstanceOf(OAuthError);
      expect((err as AuthSdkError).message).toEqual('fake_error_description');
    }
  });

});
