/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
 *
 */
import { AuthnTransaction, UserClaims, OktaAuth, TokenParams } from '@okta/okta-auth-js';
import { expectType, expectAssignable } from 'tsd';

const authClient = new OktaAuth({});

const authorizeOptions: TokenParams = {
  sessionToken: '00p8RhRDCh_8NxIin-wtF5M6ofFtRhfKWGBAbd2WmE',
  responseType: ['token', 'id_token'],
  responseMode: 'okta_post_message',
  redirectUri: 'https://some.com/redirect',
  scopes: ['openid', 'email', 'profile'],
  state: '8rFzn3MH5q',
  nonce: '51GePTswrm',
  idp: '0oa62b57p7c8PaGpU0h7',
  idpScope: 'email,profile',
  display: 'popup',
  prompt: 'consent',
  maxAge: 100,
  acrValues: 'phr',
  pkce: false,
  clientId: 'GHtf9iJdr60A9IYrR0jw',
  ignoreSignature: false,
  codeChallengeMethod: 'SHA-256',
  codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
  authorizationCode: 'ff34f',
  codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  interactionCode: 'r34r5',
  loginHint: 'aa',
  timeout: 10,
  popupTitle: 'Hello Okta',
};

const authorizeOptions2: TokenParams = {
  responseType: 'token',
  idpScope: ['email', 'profile'],
  maxAge: '100',
};

(async () => {
  // signIn
  expectType<AuthnTransaction>(await authClient.signInWithCredentials({
    username: 'some-username',
    password: 'some-password',
    sendFingerprint: true,
    context: {
      deviceToken: 'device-1'
    },
    stateToken: 'fake-state-token'
  }));
  expectType<void>(await authClient.signInWithRedirect());
  expectType<void>(await authClient.signInWithRedirect({
    originalUri: `${window.location.href}`,
    ...authorizeOptions
  }));
  expectType<void>(await authClient.signInWithRedirect({
    originalUri: `${window.location.href}`,
    ...authorizeOptions2
  }));

  // forgotPassword
  expectType<AuthnTransaction>(await authClient.forgotPassword({
    username: 'dade.murphy@example.com',
    factorType: 'SMS',
    relayState: 'd3de23'
  }));

  // unlockAccount
  expectType<AuthnTransaction>(await authClient.unlockAccount({
    username: 'dade.murphy@example.com',
    factorType: 'SMS',
    relayState: 'd3de23'
  }));

  // verifyRecoveryToken
  expectType<AuthnTransaction>(await authClient.verifyRecoveryToken({
    recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
  }));

  // Fingerprint
  expectType<string>(await authClient.fingerprint({
    timeout: 10
  }));
  expectAssignable<object>(await authClient.webfinger({
    resource: 'acct:john.joe@example.com',
    rel: 'okta:idp'
  }));

  // originalUri
  expectType<void>(authClient.setOriginalUri(`${window.location.href}`));
  expectType<string>(authClient.getOriginalUri()!);
  expectType<void>(authClient.removeOriginalUri());

  // Tokens
  expectType<string>(authClient.getIdToken()!);
  expectType<string>(authClient.getAccessToken()!);

  // User
  expectType<boolean>(await authClient.isAuthenticated());
  expectType<UserClaims>(await authClient.getUser());
  const user = { sub: 'sub', groups: ['fake group'] };
  expectAssignable<UserClaims<{
    groups: string[];
  }>>(user);

  // Redirect
  expectType<boolean>(authClient.isLoginRedirect());
  expectType<void>(await authClient.handleLoginRedirect());
  const tokens = await authClient.tokenManager.getTokens();
  expectType<void>(await authClient.handleLoginRedirect(tokens));
  expectType<void>(await authClient.handleLoginRedirect(tokens, `${window.location.href}`));
  expectType<void>(await authClient.storeTokensFromRedirect());
  expectType<void>(await authClient.handleRedirect());
  expectType<void>(await authClient.handleRedirect(`${window.location.href}`));

  // signOut
  expectType<boolean>(await authClient.signOut());
  expectType<boolean>(await authClient.signOut({
    postLogoutRedirectUri: `${window.location.origin}/logout/callback`,
    state: '1234',
    idToken: tokens.idToken,
    revokeAccessToken: false,
    revokeRefreshToken: false,
    accessToken: tokens.accessToken,
  }));
  expectAssignable<boolean>(await authClient.closeSession());
  expectType<unknown>(await authClient.revokeAccessToken(tokens.accessToken));
  expectType<unknown>(await authClient.revokeRefreshToken(tokens.refreshToken));
})();
