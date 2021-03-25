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
import {
  OktaAuth,
  OktaAuthOptions,
  TokenManager,
  AccessToken,
  IDToken,
  Token,
  Tokens,
  SessionObject,
  UserClaims,
  TokenParams,
  toRelativeUrl,
  AuthTransaction,
  TokenResponse,
  JWTObject,
  RefreshToken,
  AuthState
} from '@okta/okta-auth-js';
import {expectType, expectAssignable} from 'tsd';

const main = async () => {
  // Custom storage provider
  const myMemoryStore = {};
  const storageProvider = {
    getItem: function(key) {
      // custom get
      return myMemoryStore[key];
    },
    setItem: function(key, val) {
      // custom set
      myMemoryStore[key] = val;
    },
    // optional
    removeItem: function(key) {
      delete myMemoryStore[key];
    }
  };

  // Config
  const config: OktaAuthOptions = {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: 'GHtf9iJdr60A9IYrR0jw',
    redirectUri: 'https://acme.com/oauth2/callback/home',
    postLogoutRedirectUri: `${window.location.origin}/logout/callback`,

    responseMode: 'query',
    responseType: 'code',
    pkce: false,
    authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
    userinfoUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
    tokenUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
    ignoreSignature: true,
    maxClockSkew: 10,

    storageManager: {
      token: {
        storageType: 'sessionStorage',
        useMultipleCookies: true // puts each token in its own cookie
      },
      cache: {
        storageTypes: [
          'localStorage',
          'sessionStorage',
          'cookie'
        ]
      },
      transaction: {
        storageProvider: storageProvider
      }
    },
    
    tokenManager: {
      storage: storageProvider,
      storageKey: 'key',
      autoRenew: false,
      autoRemove: false,
      secure: true,
      expireEarlySeconds: 120,
    },

    cookies: {
      secure: true,
      sameSite: 'none'
    },
    devMode: true,

    transformAuthState: async (oktaAuth, authState) => {
      if (!authState.isAuthenticated) {
        return authState;
      }
      const user = await oktaAuth.token.getUserInfo();
      authState.isAuthenticated = !!user;
      return authState;
    },
    restoreOriginalUri: async (oktaAuth, originalUri) => {
      window.location.href = toRelativeUrl(originalUri, window.location.origin);
    },
    httpRequestClient: function(method, url, args) {
      return Promise.resolve(null);
    }
  };

  // Config with some alternative option types
  const config2: OktaAuthOptions = {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    tokenManager: {
      storage: 'cookie',
    },
    responseType: ['id_token'],
  };

  // Authorize options
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
    pkce: false,
    clientId: 'GHtf9iJdr60A9IYrR0jw',
    ignoreSignature: false,
    codeChallengeMethod: 'SHA-256',
    codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
    authorizationCode: 'ff34f',
    codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    grantType: 'authorization_code',
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

  const customUrls = {
    issuer: 'https://{yourOktaDomain}/oauth2/{authorizationServerId}',
    authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
    userinfoUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
    tokenUrl: 'https://{yourOktaDomain}/oauth2/v1/userinfo',
    revokeUrl: 'https://{yourOktaDomain}/oauth2/v1/revoke',
    logoutUrl: 'https://{yourOktaDomain}/oauth2/v1/logout',
  };
  
  // OktaAuth
  const authClient = new OktaAuth(config);
  expectType<OktaAuth>(authClient);
  const authClient2 = new OktaAuth(config2);
  expectType<OktaAuth>(authClient2);

  expectType<AuthTransaction>(await authClient.signInWithCredentials({
    username: 'some-username',
    password: 'some-password',
    sendFingerprint: true
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
  expectType<AuthTransaction>(await authClient.forgotPassword({
    username: 'dade.murphy@example.com',
    factorType: 'SMS',
    relayState: 'd3de23'
  }));
  expectType<AuthTransaction>(await authClient.unlockAccount({
    username: 'dade.murphy@example.com',
    factorType: 'SMS',
    relayState: 'd3de23'
  }));
  expectType<AuthTransaction>(await authClient.verifyRecoveryToken({
    recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
  }));

  expectAssignable<object>(await authClient.webfinger({
    resource: 'acct:john.joe@example.com',
    rel: 'okta:idp'
  }));
  expectType<string>(await authClient.fingerprint({
    timeout: 10
  }));
  expectType<string>(authClient.getIdToken());
  expectType<string>(authClient.getAccessToken());
  expectType<void>(await authClient.storeTokensFromRedirect());
  expectType<void>(authClient.setOriginalUri(`${window.location.href}`));
  expectType<string>(authClient.getOriginalUri());
  expectType<void>(authClient.removeOriginalUri());
  expectType<UserClaims>(await authClient.getUser());

  // Transaction API
  const tx = await authClient.tx.introspect();
  expectType<AuthTransaction>(tx);
  expectType<AuthTransaction>(await authClient.tx.resume());
  expectType<boolean>(await authClient.tx.exists());
  expectType<object>(await authClient.tx.status());

  // AuthTransaction
  expectType<string>(tx.status);
  expectType<AuthTransaction>(await tx.verify({
    passCode: '123456',
    autoPush: true
  }));
  expectType<AuthTransaction>(await tx.activate({
    passCode: '123456'
  }));
  expectType<AuthTransaction>(await tx.cancel());
  expectType<AuthTransaction>(await tx.poll({
    autoPush: true
  }));
  expectType<AuthTransaction>(await tx.prev());
  expectType<AuthTransaction>(await tx.skip());
  expectType<AuthTransaction>(await tx.changePassword({
    oldPassword: '0ldP4ssw0rd',
    newPassword: 'N3wP4ssw0rd'
  }));
  expectType<AuthTransaction>(await tx.resetPassword({
    newPassword: 'N3wP4ssw0rd'
  }));
  expectType<AuthTransaction>(await tx.unlock({
    username: 'dade.murphy@example.com',
    factorType: 'EMAIL',
    relayState: 'd3de23'
  }));
  expectType<AuthTransaction>(await tx.answer({
    answer: 'My favorite recovery question answer'
  }));
  expectType<AuthTransaction>(await tx.recovery({
    recoveryToken: '00xdqXOE5qDZX8-PBR1bYv8AESqIFinDy3yul01tyh'
  }));
  expectType<AuthTransaction>(await tx.resend());
  const questionFactor = tx.factors.find(function(factor) {
    return factor.provider === 'OKTA' && factor.factorType === 'question';
  });
  const questions = await questionFactor.questions() as Array<object>;
  expectType<Array<object>>(questions);
  questionFactor.enroll({
    passCode: 'cccccceukngdfgkukfctkcvfidnetljjiknckkcjulji',
    nextPassCode: '678195',
    profile: {
      credentialId: 'dade.murphy@example.com',
      question: 'disliked_food',
      answer: 'mayonnaise',
      phoneNumber: '+1-555-415-1337',
      updatePhone: true
    }
  });
  questionFactor.verify({
    passCode: '615243',
    answer: 'mayonnaise',
    autoPush: true
  });

  // Session API
  expectType<void>(authClient.session.setCookieAndRedirect(tx.sessionToken, 'https://some.com/redirect'));
  expectType<boolean>(await authClient.session.exists());
  const session = await authClient.session.get();
  expectType<SessionObject>(session);
  expectType<object>(await authClient.session.close());
  expectType<object>(await authClient.session.refresh());

  // Session
  expectType<string>(session.status);
  expectType<object>(await session.user());
  expectType<object>(await session.refresh());

  // Token API
  const tokenRes = await authClient.token.getWithoutPrompt(authorizeOptions);
  expectType<TokenResponse>(tokenRes);
  expectType<Tokens>(tokenRes.tokens);
  expectType<AccessToken>(tokenRes.tokens.accessToken);
  expectType<IDToken>(tokenRes.tokens.idToken);
  expectType<RefreshToken>(tokenRes.tokens.refreshToken);
  const idTokenExample = {
    expiresAt: 1449699930,
    scopes: ['openid', 'email'],
    authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
    value: 'TOKEN_JWT',
    idToken: 'TOKEN_JWT',
    claims: { /* token claims */ } as UserClaims,
    issuer: 'https://{yourOktaDomain}',
    clientId: 'NPSfOkH5eZrTy8PMDlvx'
  };
  expectAssignable<IDToken>(idTokenExample);
  const accessTokenExample = {
    expiresAt: 1449699930,
    scopes: ['openid', 'email'],
    authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
    value: 'TOKEN_JWT',
    accessToken: 'TOKEN_JWT',
    claims: { /* token claims */ } as UserClaims,
    tokenType: 'aud',
    userinfoUrl: 'https://some.com/userinfo'
  };
  expectAssignable<AccessToken>(accessTokenExample);
  const refreshTokenExample = {
    expiresAt: 1449699930,
    scopes: ['openid', 'email'],
    authorizeUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
    value: 'TOKEN_JWT',
    refreshToken: 'TOKEN_JWT',
    claims: { /* token claims */ } as UserClaims,
    tokenUrl: 'https://some.com/token',
    issuer: 'https://{yourOktaDomain}'
  };
  expectAssignable<RefreshToken>(refreshTokenExample);
  expectType<TokenResponse>(await authClient.token.getWithPopup(authorizeOptions));
  expectType<void>(await authClient.token.getWithRedirect(authorizeOptions));
  expectType<TokenResponse>(await authClient.token.parseFromUrl());
  const decodedToken = authClient.token.decode('ID_TOKEN_JWT');
  expectType<JWTObject>(decodedToken);
  expectType<UserClaims>(decodedToken.payload);
  expectType<string>(decodedToken.header.alg);
  expectType<string>(decodedToken.signature);
  expectType<Token>(await authClient.token.renew(accessTokenExample));
  const userInfo = await authClient.token.getUserInfo(accessTokenExample, idTokenExample);
  expectType<UserClaims>(userInfo);
  const validationOptions = {
    issuer: 'https://{yourOktaDomain}/oauth2/{authorizationServerId}'
  };
  expectType<IDToken>(await authClient.token.verify(idTokenExample, validationOptions));
  expectType<TokenParams>(await authClient.token.prepareTokenParams(authorizeOptions));
  expectType<TokenResponse>(await authClient.token.exchangeCodeForTokens(authorizeOptions, customUrls));

  // TokenManager
  const tokenManager = authClient.tokenManager;
  expectType<TokenManager>(tokenManager);
  expectType<void>(tokenManager.add('accessToken', accessTokenExample));
  const accessToken = await tokenManager.get('accessToken') as AccessToken;
  expectAssignable<AccessToken>(accessToken);
  const idToken = await tokenManager.get('idToken') as IDToken;
  expectAssignable<IDToken>(idToken);
  const tokens = await tokenManager.getTokens();
  expectType<Tokens>(tokens);
  const refreshToken = tokens.refreshToken;
  expectType<boolean>(tokenManager.hasExpired(accessToken));
  tokenManager.setTokens(tokenRes.tokens);
  expectType<void>(tokenManager.remove('accessToken'));
  expectType<void>(tokenManager.clear());
  expectAssignable<Token>(await tokenManager.renew('idToken'));
  tokenManager.on('expired', function (key, expiredToken) {
    expectType<string>(key);
    expectAssignable<Token>(expiredToken);
  });
  tokenManager.on('renewed', function (key, newToken, oldToken) {
    expectAssignable<string>(key);
    expectAssignable<Token>(newToken);
    expectAssignable<Token>(oldToken);
  });
  tokenManager.on('error', function (error) {
    expectAssignable<object>(error);
  });
  tokenManager.off('error', () => {});
  tokenManager.off('error');

  // Auth State Manager
  const authStateManager = authClient.authStateManager;
  authStateManager.subscribe((authState: AuthState) => {});
  authStateManager.unsubscribe((authState: AuthState) => {});
  authStateManager.unsubscribe();
  authStateManager.updateAuthState();
  const authState = authStateManager.getAuthState();
  expectType<AuthState>(authState);
  expectType<AccessToken>(authState.accessToken);
  expectType<IDToken>(authState.idToken);
  expectType<RefreshToken>(authState.refreshToken);
  expectType<boolean>(authState.isAuthenticated);
  expectType<boolean>(authState.isPending);
  expectType<string>(authState.error.message);

  // Redirect
  expectType<boolean>(authClient.isLoginRedirect());
  expectType<boolean>(await authClient.isAuthenticated());
  expectType<boolean>(await authClient.isAuthenticated(10));
  expectType<void>(await authClient.handleLoginRedirect());
  expectType<void>(await authClient.handleLoginRedirect(tokens));

  // signOut
  expectAssignable<object>(await authClient.closeSession());
  expectType<object>(await authClient.revokeAccessToken(accessToken));
  expectType<object>(await authClient.revokeRefreshToken(refreshToken));
  expectType<void>(await authClient.signOut());
  expectType<void>(await authClient.signOut({
    postLogoutRedirectUri: `${window.location.origin}/logout/callback`,
    state: '1234',
    idToken: idToken,
    revokeAccessToken: false,
    revokeRefreshToken: false,
    accessToken: accessToken,
  }));
};

main();
