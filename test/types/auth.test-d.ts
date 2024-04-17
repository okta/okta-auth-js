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
import { expect } from 'tstyche';

const authClient = new OktaAuth({issuer: 'https://{yourOktaDomain}/oauth2/default'});

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
  expect(await authClient.signInWithCredentials({
    username: 'some-username',
    password: 'some-password',
    sendFingerprint: true,
    context: {
      deviceToken: 'device-1'
    },
    stateToken: 'fake-state-token'
  })).type.toEqual<AuthnTransaction>();
  expect(await authClient.signInWithRedirect()).type.toEqual<void>();
  expect(await authClient.signInWithRedirect({
    originalUri: `${window.location.href}`,
    ...authorizeOptions
  })).type.toEqual<void>();
  expect(await authClient.signInWithRedirect({
    originalUri: `${window.location.href}`,
    ...authorizeOptions2
  })).type.toEqual<void>();

  // forgotPassword
  expect(await authClient.forgotPassword({
    username: 'dade.murphy@example.com',
    factorType: 'SMS',
    relayState: 'd3de23'
  })).type.toEqual<AuthnTransaction>();

  // unlockAccount
  expect(await authClient.unlockAccount({
    username: 'dade.murphy@example.com',
    factorType: 'SMS',
    relayState: 'd3de23'
  })).type.toEqual<AuthnTransaction>();

  // verifyRecoveryToken
  expect(await authClient.verifyRecoveryToken({
    recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
  })).type.toEqual<AuthnTransaction>();

  // Fingerprint
  expect(await authClient.fingerprint({
    timeout: 10
  })).type.toEqual<string>();
  expect(await authClient.webfinger({
    resource: 'acct:john.joe@example.com',
    rel: 'okta:idp'
  })).type.toBeAssignable<object>();

  // originalUri
  expect(authClient.setOriginalUri(`${window.location.href}`)).type.toEqual<void>();
  expect(authClient.getOriginalUri()!).type.toEqual<string>();
  expect(authClient.removeOriginalUri()).type.toEqual<void>();

  // Tokens
  expect(authClient.getIdToken()!).type.toEqual<string>();
  expect(authClient.getAccessToken()!).type.toEqual<string>();

  // User
  expect(await authClient.isAuthenticated()).type.toEqual<boolean>();
  expect(await authClient.getUser()).type.toEqual<UserClaims>();
  const user = { sub: 'sub', groups: ['fake group'] };
  expect(user).type.toBeAssignable<UserClaims<{
    groups: string[];
  }>>();

  // Redirect
  expect(authClient.isLoginRedirect()).type.toEqual<boolean>();
  expect(await authClient.handleLoginRedirect()).type.toEqual<void>();
  const tokens = await authClient.tokenManager.getTokens();
  expect(await authClient.handleLoginRedirect(tokens)).type.toEqual<void>();
  expect(await authClient.handleLoginRedirect(tokens, `${window.location.href}`)).type.toEqual<void>();
  expect(await authClient.storeTokensFromRedirect()).type.toEqual<void>();
  expect(await authClient.handleRedirect()).type.toEqual<void>();
  expect(await authClient.handleRedirect(`${window.location.href}`)).type.toEqual<void>();

  // signOut
  expect(await authClient.signOut()).type.toEqual<boolean>();
  expect(await authClient.signOut({
    postLogoutRedirectUri: `${window.location.origin}/logout/callback`,
    state: '1234',
    idToken: tokens.idToken,
    revokeAccessToken: false,
    revokeRefreshToken: false,
    accessToken: tokens.accessToken,
  })).type.toEqual<boolean>();
  expect(await authClient.closeSession()).type.toBeAssignable<boolean>();
  expect(await authClient.revokeAccessToken(tokens.accessToken)).type.toEqual<unknown>();
  expect(await authClient.revokeRefreshToken(tokens.refreshToken)).type.toEqual<unknown>();
})();
