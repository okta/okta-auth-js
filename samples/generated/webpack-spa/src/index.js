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


import '@okta/okta-auth-js/polyfill';
import { OktaAuth } from '@okta/okta-auth-js';
import OktaSignIn from '@okta/okta-signin-widget';

// Sample SPA application
var authClient;
var appState = {};
// bind methods called from HTML to prevent navigation
function bindClick(method, boundArgs) {
  return function(e) {
    e.preventDefault();
    const runtimeArgs = Array.prototype.slice.call(arguments, 1);
    try {
      method.apply(null, runtimeArgs.concat(boundArgs));
    } catch (err) {
      showError(err);
    }
    return false;
  };
}

function stringify(obj) {
  // Convert false/undefined/null into "null"
  if (!obj) {
    return 'null';
  }
  return JSON.stringify(obj, null, 2);
}
// Default config. Properties here match the names of query parameters in the URL
var config = {
  issuer: '',
  clientId: '',
  scopes: ['openid','email'],
  storage: 'sessionStorage',
  useInteractionCodeFlow: true,
  requireUserSession: 'true',
  authMethod: 'form',
  startService: false,
  useDynamicForm: false,
  uniq: Date.now() + Math.round(Math.random() * 1000), // to guarantee a unique state
  idps: '',
};

/* eslint-disable max-statements,complexity */
function loadConfig() {
  // Read all config from the URL
  var url = new URL(window.location.href);
  var redirectUri = window.location.origin + '/login/callback'; // Should also be set in Okta Admin UI
  
  // Params which are not in the state
  var stateParam = url.searchParams.get('state'); // received on login redirect callback
  var error = url.searchParams.get('error'); // received on login redirect callback
  var showForm = url.searchParams.get('showForm'); // forces config form to show
  var getTokens = url.searchParams.get('getTokens'); // forces redirect to get tokens
  var recoveryToken = url.searchParams.get('recoveryToken');

  // Params which are encoded into the state
  var issuer;
  var clientId;
  var appUri;
  var storage;
  var authMethod;
  var startService;
  var requireUserSession;
  var scopes;
  var useInteractionCodeFlow;
  var useDynamicForm;

  var idps;

  var state;
  try {
    // State will be passed on callback. If state exists in the URL parse it as a JSON object and use those values.
    state = stateParam ? JSON.parse(stateParam) : null;
  } catch (e) {
    console.warn('Could not parse state from the URL.');
  }
  if (state) {
    // Read from state
    issuer = state.issuer;
    clientId = state.clientId;
    storage = state.storage;
    authMethod = state.authMethod;
    startService = state.startService;
    requireUserSession = state.requireUserSession;
    scopes = state.scopes;
    useInteractionCodeFlow = state.useInteractionCodeFlow;
    useDynamicForm = state.useDynamicForm;
    config.uniq = state.uniq;
    idps = state.idps;
  } else {
    // Read individually named parameters from URL, or use defaults
    // Note that "uniq" is not read from the URL to prevent stale state
    issuer = url.searchParams.get('issuer') || config.issuer;
    clientId = url.searchParams.get('clientId') || config.clientId;
    storage = url.searchParams.get('storage') || config.storage;
    authMethod = url.searchParams.get('authMethod') || config.authMethod;
    startService = url.searchParams.get('startService') === 'true' || config.startService;
    requireUserSession = url.searchParams.get('requireUserSession') ? 
      url.searchParams.get('requireUserSession')  === 'true' : config.requireUserSession;
    scopes = url.searchParams.get('scopes') ? url.searchParams.get('scopes').split(' ') : config.scopes;
    useInteractionCodeFlow = url.searchParams.get('useInteractionCodeFlow') === 'true' || config.useInteractionCodeFlow;
    useDynamicForm = url.searchParams.get('useDynamicForm') === 'true' || config.useDynamicForm;
    idps = url.searchParams.get('idps') || config.idps;
  }
  // Create a canonical app URI that allows clean reloading with this config
  appUri = window.location.origin + '/' + '?' + Object.entries({
    issuer,
    clientId,
    storage,
    requireUserSession,
    authMethod,
    startService,
    scopes: scopes.join(' '),
    useInteractionCodeFlow,
    useDynamicForm,
    idps,
  }).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  // Add all app options to the state, to preserve config across redirects
  state = {
    uniq: config.uniq,
    issuer,
    clientId,
    storage,
    requireUserSession,
    authMethod,
    startService,
    scopes,
    useInteractionCodeFlow,
    useDynamicForm,
    idps,
  };
  var newConfig = {};
  Object.assign(newConfig, state);
  Object.assign(newConfig, {
    // ephemeral options, will not survive a redirect
    appUri,
    redirectUri,
    state,
    error,
    showForm,
    getTokens,
    recoveryToken
  });
  Object.assign(config, newConfig);
  // Render the config to HTML
  var logConfig = {};
  var skipKeys = ['state', 'appUri', 'error', 'showForm', 'getTokens']; // internal config
  Object.keys(config).forEach(function(key) {
    if (skipKeys.indexOf(key) < 0) {
      logConfig[key] = config[key];
    }
  });
  document.getElementById('config').innerText = stringify(logConfig);
}


function showForm() {
  // Set values from config
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('clientId').value = config.clientId;
  document.getElementById('scopes').value = config.scopes.join(' ');
  document.getElementById('idps').value = config.idps;
  try {
    document.querySelector(`#authMethod [value="${config.authMethod || ''}"]`).selected = true;
  } catch (e) { showError(e); }

  if (config.startService) {
    document.getElementById('startService-on').checked = true;
  } else {
    document.getElementById('startService-off').checked = true;
  }

  if (config.requireUserSession) {
    document.getElementById('requireUserSession-on').checked = true;
  } else {
    document.getElementById('requireUserSession-off').checked = true;
  }
  try {
    document.querySelector(`#storage [value="${config.storage || ''}"]`).selected = true;
  } catch (e) { showError(e); }

  if (config.useInteractionCodeFlow) {
    document.getElementById('useInteractionCodeFlow-on').checked = true;
  } else {
    document.getElementById('useInteractionCodeFlow-off').checked = true;
  }
  
  if (config.useDynamicForm) {
    document.getElementById('useDynamicForm-on').checked = true;
  } else {
    document.getElementById('useDynamicForm-off').checked = true;
  }


  // Show the form
  document.getElementById('config-form').style.display = 'block'; // show form

  onChangeAuthMethod();
}

function onChangeAuthMethod() {
  const authMethod = document.getElementById('authMethod').value;
  document.querySelector('#form .field-useDynamicForm').style.display = authMethod == 'form' ? 'block' : 'none';
  document.querySelector('#form .field-idps').style.display = authMethod == 'widget' ? 'block' : 'none';
}
window._onChangeAuthMethod = onChangeAuthMethod;

// Keep us in the same tab
function onSubmitForm(event) {
  event.preventDefault();

  // clear transaction data to prevent odd behavior when switching to static form
  sessionStorage.clear();

  // eslint-disable-next-line no-new
  new FormData(document.getElementById('form')); // will fire formdata event
}
window._onSubmitForm = onSubmitForm;

function onFormData(event) {
  let data = event.formData;
  let params = {};
  for (let key of data.keys()) {
    params[key] = data.get(key);
  }
  const query = '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const newUri = window.location.origin + '/' + query;
  window.location.replace(newUri);
}
window._onFormData = onFormData;

// Wait for DOM content to be loaded before starting the app
document.addEventListener('DOMContentLoaded', () => {
  // load config from the URL params
  loadConfig();

  // start all the things
  main();
});


function createAuthClient() {
  // The `OktaAuth` constructor can throw if the config is malformed
  try {
    authClient = new OktaAuth({
      issuer: config.issuer,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scopes: config.scopes,
      tokenManager: {
        storage: config.storage
      },
      transformAuthState,
      recoveryToken: config.recoveryToken
    });
    if (config.startService) {
      authClient.start();
    }
  } catch (error) {
    return showError(error);
  }
}

function updateAppState(props) {
  Object.assign(appState, props);
  document.getElementById('appState').innerText = stringify(appState);
}

// Modifies the "authState" object before it is emitted. This is a chance to add custom logic and extra properties.
function transformAuthState(_authClient, authState) {
  var promise = Promise.resolve(authState);

  if (authState.accessToken && authState.idToken) {
    authState.hasTokens = true;
  }

  // With this option we require the user to have not only valid tokens, but a valid Okta SSO session as well
  if (config.requireUserSession && authState.hasTokens) {
    promise = promise.then(function() {
      return appState.userInfo || authClient.token.getUserInfo();
    }).then(function(value) {
      updateAppState({ userInfo: value });
      authState.isAuthenticated = authState.isAuthenticated && !!appState.userInfo;
      return authState;
    });
  }

  return promise;
}

function main() {
  // Configuration is loaded from URL query params. Make sure the links contain the full config
  document.getElementById('home-link').setAttribute('href', config.appUri);
  document.getElementById('options-link').setAttribute('href', config.appUri + '&showForm=true');

  if (config.showForm) {
    showForm();
    return;
  }

  var hasValidConfig = !!(config.issuer && config.clientId);
  if (!hasValidConfig) {
    showError('Click "Edit Config" and set the `issuer` and `clientId`');
    return renderUnauthenticated();
  }

  // Config is valid
  createAuthClient();

  // Subscribe to authState change event. Logic based on authState is done here.
  authClient.authStateManager.subscribe(function(authState) {
    if (!authState.isAuthenticated) {
      // If not authenticated, reset values related to user session
      updateAppState({ userInfo: null });
    }

    // If there is an active session, we can get tokens via a redirect
    // This allows in-memory token storage without prompting for credentials on each page load
    if (shouldRedirectToGetTokens(authState)) {
      return redirectToGetTokens();
    }

    // Render app based on the new authState
    renderApp();
  });

  // During the OIDC auth flow, the app will receive a code passed to the `redirectUri`
  // This event occurs *in the middle* of an authorization flow
  // The callback handler logic should happen *before and instead of* any other auth logic
  // In most apps this callback will be handled by a special route
  // For SPA apps like this, with no routing or hash-based routing, the callback is handled in the main function
  // Once the callback is handled, the app can startup normally
  if (authClient.token.isLoginRedirect()) {
    return handleLoginRedirect().then(function() {
      startApp();
    });
  } 
  
  // Normal app startup
  startApp();
}

function startApp() {
  // Calculates initial auth state and fires change event for listeners
  // Also starts the token auto-renew service
  authClient.start();
}

function renderApp() {
  const authState = authClient.authStateManager.getAuthState();
  document.getElementById('authState').innerText = stringify(authState);

  // Setting auth state is an asynchronous operation. If authState is not available yet, render in the loading state
  if (!authState) {
    return showLoading();
  }

  hideLoading();
  if (authState.isAuthenticated) {
    return renderAuthenticated(authState);
  }

  // Default: Unauthenticated state
  return renderUnauthenticated();
}

function showLoading() {
  document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function renderAuthenticated(authState) {
  document.body.classList.add('auth');
  document.body.classList.remove('unauth');
  document.getElementById('auth').style.display = 'block';
  document.getElementById('accessToken').innerText = stringify(authState.accessToken);
  renderUserInfo(authState);
}

function renderUserInfo(authState) {
  const obj = appState.userInfo || authState.userInfo || {};
  const attributes = Object.keys(obj);
  const rows = attributes.map((key) => {
    return `
      <tr>
        <td>${key}</td>
        <td id="claim-${key}">${obj[key]}</td>
      </tr>
    `;
  });
  const table = `
    <table class="ui table compact collapsing">
      <thead>
        <tr>
          <th>Claim</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join('')}
      </tbody>
    </table>
  `;
  document.getElementById('userInfo').innerHTML = table;
}

function renderUnauthenticated() {
  // The user is not authenticated, the app will begin an auth flow.
  document.body.classList.add('unauth');
  document.body.classList.remove('auth');
  document.getElementById('auth').style.display = 'none';

  // The `handleLoginRedirect` may have failed. An error or remediation should be shown.
  if (!authClient || authClient.token.isLoginRedirect()) {
    return;
  }

  // Unauthenticated state, begin an auth flow
  return beginAuthFlow();
}

function handleLoginRedirect() {
  if (authClient.idx.isInteractionRequired()) {
    beginAuthFlow(); // widget will resume transaction
    return Promise.resolve();
  }
  

  // If the URL contains a code, `parseFromUrl` will grab it and exchange the code for tokens
  return authClient.token.parseFromUrl().then(function (res) {
    endAuthFlow(res.tokens); // save tokens
  }).catch(function(error) {
    showError(error);
  });
}

// called when the "get user info" link is clicked
function getUserInfo() {
  return authClient.token.getUserInfo()
    .then(function(value) {
      updateAppState({ userInfo: value });
      renderApp();
    })
    .catch(function (error) {
      // This is expected when Okta SSO does not exist
      showError(error);
    });
}
window._getUserInfo = bindClick(getUserInfo);

// called when the "renew token" link is clicked
function renewToken() {
  // when the token is written to storage, the authState will change and we will re-render.
  return authClient.tokenManager.renew('accessToken')
    .catch(function(error) {
      showError(error);
    });
}
window._renewToken = bindClick(renewToken);

function beginAuthFlow() {
  switch (config.authMethod) {
    case 'redirect':
      showRedirectButton();
      break;
    case 'widget':
      showSigninWidget();
      break;
    case 'form':
      showSigninForm();
      break;
  }
}

function endAuthFlow(tokens) {
  // parseFromUrl clears location.search. There may also be a leftover "error" param from the auth flow.
  // Replace state with the canonical app uri so the page can be reloaded cleanly.
  history.replaceState(null, '', config.appUri);

  // Store tokens. This will update the auth state and we will re-render
  authClient.tokenManager.setTokens(tokens);
}

function showRedirectButton() {
  document.getElementById('authMethod-redirect').style.display = 'block';
}

function logout(e) {
  e.preventDefault();
  appState = {};
  // Normally tokens are cleared after redirect. For in-memory storage we should clear before.
  const clearTokensBeforeRedirect = config.storage === 'memory';
  authClient.signOut({ clearTokensBeforeRedirect });
}
window._logout = logout;


function showError(error) {
  console.error(error);
  const containerElem = document.getElementById('error');
  containerElem.style.display = 'block';
  var node = document.createElement('DIV');
  node.innerText = error.message || typeof error === 'string' ? error : JSON.stringify(error, null, 2);
  containerElem.appendChild(node);
}

function clearError() {
  const containerElem = document.getElementById('error');
  containerElem.innerHTML = '';
  containerElem.style.display = 'none';
}

function returnHome() {
  window.location.href = config.appUri;
}
window._returnHome = bindClick(returnHome);

function shouldRedirectToGetTokens(authState) {
  if (authState.isAuthenticated) {
    return false;
  }

  // Special handling for memory-based token storage.
  // There will be a redirect on each page load to acquire fresh tokens.
  if (config.storage === 'memory' || config.getTokens) {

    // Callback from Okta triggered by `redirectToGetTokens`
    // If the callback has errored, it means there is no Okta session and we should begin a new auth flow
    // This condition breaks a potential infinite rediret loop
    if (config.error === 'login_required') {
      return false;
    }

    // AuthState error. This can happen when an exception is thrown inside transformAuthState.
    // Return false to break a potential infinite loop
    if (authState.error) {
      return false;
    }

    // Call Okta to get tokens. Okta will redirect back to this app
    // The callback is handled by `handleLoginRedirect` which will call `renderApp` again
    return true;
  }
}

function redirectToGetTokens(additionalParams) {
  // If an Okta SSO exists, the redirect will return a code which can be exchanged for tokens
  // If a session does not exist, it will return with "error=login_required"
  authClient.token.getWithRedirect(Object.assign({
    state: JSON.stringify(config.state),
    prompt: 'none' // do not show Okta hosted login page, instead redirect back with error
  }, additionalParams));
}

function redirectToLogin(additionalParams) {
  // Redirect to Okta and show the signin widget if there is no active session
  authClient.token.getWithRedirect(Object.assign({
    state: JSON.stringify(config.state),
  }, additionalParams));
}
window._loginRedirect = bindClick(redirectToLogin);
function showSigninWidget(options) {
  // Create widget options
  options = Object.assign({
    baseUrl: config.issuer.split('/oauth2')[0],
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    useInteractionCodeFlow: config.useInteractionCodeFlow,
    state: JSON.stringify(config.state),
    authParams: {
      issuer: config.issuer
    },
    idps: config.idps.split(/\s+/).map(idpToken => {
      const [type, id] = idpToken.split(/:/);
      if (!type || !id) {
         return null;
      }
      return { type, id };
    }).filter(idpToken => idpToken)
  }, options);

  // Create an instance of the signin widget
  var signIn = new OktaSignIn(options);

  signIn.showSignIn({
    el: '#signin-widget'
  })
  .then(function(response) {
    document.getElementById('authMethod-widget').style.display = 'none';
    signIn.remove();
    endAuthFlow(response.tokens);
  })
  .catch(function(error) {
    console.log('login error', error);
  });

  document.getElementById('authMethod-widget').style.display = 'block'; // show login UI
}
function resumeTransaction(options) {
  if (!config.useInteractionCodeFlow) {
    // Authn
    if (authClient.tx.exists()) {
      return authClient.tx.resume()
        .then(handleTransaction)
        .catch(showError);
    }
    return;
  }

  if (authClient.transactionManager.exists(options)) {
    return authClient.idx.proceed(options)
      .then(handleTransaction)
      .catch(showError);
  }
}

function showSigninForm(options) {
  hideRecoveryChallenge();
  hideNewPasswordForm();

  // Authn must use static login form
  if (config.useDynamicForm === false || !config.useInteractionCodeFlow) {
    // Is there an existing transaction we can resume? If so, we will be in MFA flow
    if (resumeTransaction(options)) {
      return;
    }
    document.getElementById('static-signin-form').style.display = 'block';
    return;
  }

  // Dynamic form
  document.getElementById('static-signin-form').style.display = 'none';
  renderDynamicSigninForm(); // will be empty until first server response
  return authClient.idx.authenticate()
    .then(handleTransaction)
    .catch(showError);
}
window._showSigninForm = bindClick(showSigninForm);

function hideSigninForm() {
  document.getElementById('static-signin-form').style.display = 'none';
  document.getElementById('dynamic-signin-form').style.display = 'none';
}

function submitStaticSigninForm() {
  const username = document.querySelector('#static-signin-form input[name=username]').value;
  const password = document.querySelector('#static-signin-form input[name=password]').value;

  if (!config.useInteractionCodeFlow) {
    // Authn
    return authClient.signIn({ username, password })
      .then(handleTransaction)
      .catch(showError);
  }

  return authClient.idx.authenticate({ username, password })
    .then(handleTransaction)
    .catch(showError);

}
window._submitStaticSigninForm = bindClick(submitStaticSigninForm);

function renderDynamicSigninForm(transaction) {
  document.getElementById('dynamic-signin-form').style.display = 'block';
  [
    '.field-username',
    '.field-password',
    '.link-recover-password',
    '.link-signin'
  ].forEach(function(key) {
    document.querySelector(`#dynamic-signin-form ${key}`).style.display = 'none';
  });
  if (!transaction) {
    return;
  }
  const inputs = transaction.nextStep.inputs;
  if (inputs.some(input => input.name === 'username')) {
    document.querySelector('#dynamic-signin-form .field-username').style.display = 'block';
  }
  if (inputs.some(input => input.name === 'password')) {
    document.querySelector('#dynamic-signin-form .field-password').style.display = 'block';
  }
  if (transaction.enabledFeatures.includes('recover-password')) {
    document.querySelector('#dynamic-signin-form .link-recover-password').style.display = 'inline-block';
  }
  document.querySelector('#dynamic-signin-form .link-signin').style.display = 'inline-block';
}

function submitDynamicSigninForm() {
  const username = document.querySelector('#dynamic-signin-form input[name=username]').value;
  const password = document.querySelector('#dynamic-signin-form input[name=password]').value;
  hideSigninForm();
  return authClient.idx.authenticate({ username, password })
    .then(handleTransaction)
    .catch(showError);

}
window._submitDynamicSigninForm = bindClick(submitDynamicSigninForm);

function handleTransaction(transaction) {
  if (!config.useInteractionCodeFlow) {
    // Authn
    return handleTransactionAuthn(transaction);
  }

  // IDX
  if (transaction.messages) {
    showError(transaction.messages);
  }

  switch (transaction.status) {
    case 'PENDING':
      if (transaction.nextStep.name === 'identify') {
        renderDynamicSigninForm(transaction);
        break;
      }
      hideSigninForm();
      updateAppState({ transaction });
      showMfa();
      break;
    case 'FAILURE':
      showError(transaction.error);
      break;
    case 'SUCCESS':
      hideSigninForm();
      endAuthFlow(transaction.tokens);
      break;
    default:
      throw new Error('TODO: add handling for ' + transaction.status + ' status');
  }
}

function handleTransactionAuthn(transaction) {
  switch (transaction.status) {
    case 'SUCCESS':
      authClient.session.setCookieAndRedirect(transaction.sessionToken, config.appUri + '&getTokens=true');
      break;
    case 'RECOVERY_CHALLENGE':
      updateAppState({ transaction });
      showRecoveryChallenge();
      break;
    case 'MFA_ENROLL':
    case 'MFA_REQUIRED':
    case 'MFA_ENROLL_ACTIVATE':
    case 'MFA_CHALLENGE':
      hideSigninForm();
      updateAppState({ transaction });
      showMfa();
      return;
    default:
      throw new Error('TODO: add handling for ' + transaction.status + ' status');
  }
}

// MFA https://github.com/okta/okta-auth-js/blob/master/docs/authn.md
function factorName(factor) {
  let name = `${factor.provider}: ${factor.factorType}`; // generic factor name
  if (factor.provider === 'OKTA') {
    switch (factor.factorType) {
      case 'question':
        name = 'Security Question';
        break;
      case 'push':
        name = 'Okta Verify (push)';
        break;
      case 'token:software:totp':
        name = 'Okta Verify (TOTP)';
        break;
    }
  }
  return name;
}

function resetMfa() {
  appState = {};
  clearError();
  showSigninForm();
}

function hideMfa() {
  document.getElementById('mfa').style.display = 'none';
  document.querySelector('#mfa .header').innerHTML = '';
  hideSubmitMfa();
  hideMfaEnroll();
  hideMfaEnrollActivate();
  hideMfaRequired();
  hideMfaChallenge();
  hideAuthenticatorVerificationData();
}

function showMfa() {
  document.getElementById('mfa').style.display = 'block';
  if (!config.useInteractionCodeFlow) {
    return showMfaAuthn();
  }

  const transaction = appState.transaction;
  if (transaction.status === 'PENDING') {
    const nextStep = transaction.nextStep;
    switch (nextStep.name) {
      case 'select-authenticator-enroll':
        showMfaEnrollFactors();
        break;
      case 'authenticator-enrollment-data':
        showAuthenticatorEnrollmentData();
        break;
      case 'authenticator-verification-data':
        showAuthenticatorVerificationData();
        break;
      case 'enroll-authenticator':
      case 'challenge-authenticator':
        showMfaChallenge();
        break;
      case 'select-authenticator-authenticate':
        showMfaRequired();
        break;
      case 'reset-authenticator':
        showResetAuthenticator();
        break;
      default:
        throw new Error(`TODO: showMfa: handle nextStep: ${nextStep.name}`);
    }
  }
}

// IDX
function showResetAuthenticator() {
  document.querySelector('#mfa .header').innerText = 'Reset Authenticator';

  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'password') {
    return showNewPasswordForm();
  }

  throw new Error(`TODO: handle reset-authenticator for authenticator: ${authenticator.type}`);
}

function showMfaAuthn() {
  const transaction = appState.transaction;
  // MFA_ENROLL https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#mfa_enroll
  if (transaction.status === 'MFA_ENROLL') {
    return showMfaEnrollFactors();
  }
  // MFA_ENROLL_ACTIVATE https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#mfa_enroll_activate
  if (transaction.status === 'MFA_ENROLL_ACTIVATE') {
    return showMfaEnrollActivate();
  }
    // MFA_REQUIRED https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#mfa_required
  if (transaction.status === 'MFA_REQUIRED') {
    return showMfaRequired();
  }
  // MFA_CHALLENGE https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#mfa_challenge
  if (transaction.status === 'MFA_CHALLENGE') {
    return showMfaChallenge();
  }
  throw new Error(`TODO: showMfaAuthn: handle transaction status ${appState.transaction.status}`);
}

// cancel - terminates the auth flow.
function showCancelMfa() {
  document.getElementById('mfa-cancel').style.display = 'inline';
  hidePrevMfa();
}
function hideCancelMfa() {
  document.getElementById('mfa-cancel').style.display = 'none';
}
function cancelMfa() {
  hideMfa();
  if (!config.useInteractionCodeFlow) {
    // https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#cancel
    return appState.transaction.cancel().finally(resetMfa);
  }

  authClient.transactionManager.clear();
  resetMfa();
}
window._cancelMfa = bindClick(cancelMfa);

// prev - go back to previous state
function showPrevMfa() {
  document.getElementById('mfa-prev').style.display = 'inline';
  hideCancelMfa();
}
function hidePrevMfa() {
  document.getElementById('mfa-prev').style.display = 'none';
}
function prevMfa() {
  hideMfa();
  if (!config.useInteractionCodeFlow) {
    // End current factor enrollment and return to MFA_ENROLL.
    // https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#prev
    return appState.transaction.prev()
      .then(handleTransaction)
      .catch(showError);
  }

  // TODO: is there a way to go back a step in IDX?
  authClient.transactionManager.clear();
  resetMfa();
}
window._prevMfa = bindClick(prevMfa);

// submit - will enroll or verify depending on the state.
function showSubmitMfa() {
  document.getElementById('mfa-submit').style.display = 'inline';
}
function hideSubmitMfa() {
  document.getElementById('mfa-submit').style.display = 'none';
}
function submitMfa() {
  if (!config.useInteractionCodeFlow) {
    return submitMfaAuthn();
  }

  const nextStep = appState.transaction.nextStep;
  if (nextStep.name === 'authenticator-enrollment-data') {
    return submitAuthenticatorEnrollmentData();
  }
  if (nextStep.name === 'authenticator-verification-data') {
    return submitAuthenticatorVerificationData();
  }
  if (nextStep.name === 'challenge-authenticator' || nextStep.name === 'enroll-authenticator') {
    return submitChallengeAuthenticator();
  }
  if (nextStep.name === 'reset-authenticator') {
    return submitNewPasswordForm();
  }
  throw new Error(`TODO: submitMfa: handle submit for nextStep: ${nextStep.name}`);
}
window._submitMfa = bindClick(submitMfa);

function submitMfaAuthn() {
  const transaction = appState.transaction;
  if (transaction.status === 'MFA_ENROLL') {
    return submitEnroll();
  }
  if (transaction.status === 'MFA_ENROLL_ACTIVATE') {
    return submitEnrollActivate();
  }
  if (transaction.status === 'MFA_REQUIRED') {
    return submitMfaRequired();
  }
  if (transaction.status === 'MFA_CHALLENGE') {
    return submitChallenge();
  }
  throw new Error(`TODO: submitMfaAuthn: handle submit for transaction status: ${transaction.status}`);
}

function listMfaFactors() {
  const transaction = appState.transaction;
  if (!config.useInteractionCodeFlow) {
    // Authn
    return transaction.factors.map(factor => factorName(factor));
  }

  // IDX
  return transaction.nextStep.options.map(option => option.label);
}

// Show a list of MFA factors. The user can pick a factor to enroll in.
function hideMfaEnroll() {
  document.getElementById('mfa-enroll').style.display = 'none';
  hideMfaEnrollFactors();
  hideEnrollQuestion();
  hideEnrollPhone();
}

function showMfaEnroll() {
  document.getElementById('mfa-enroll').style.display = 'block';
  showCancelMfa();
  document.querySelector('#mfa .header').innerText = 'Enroll in an MFA factor';
}

function showMfaEnrollFactors() {
  showMfaEnroll();
  const containerElement = document.getElementById('mfa-enroll-factors');
  containerElement.style.display = 'block';
  const names = listMfaFactors();
  names.forEach(function(name, index) {
    const el = document.createElement('div');
    el.setAttribute('id', `enroll-factor-${index}`);
    el.setAttribute('class', `factor panel`);
    el.innerHTML = `
      <span>${name}</span>
      <a href="#" onclick="_selectMfaFactorForEnrollment(event, ${index})">Enroll</a>
    `;
    containerElement.appendChild(el);
  });
}

function hideMfaEnrollFactors() {
  const containerElement = document.getElementById('mfa-enroll-factors');
  containerElement.style.display = 'none';
  containerElement.innerHTML = '';
}

function selectMfaFactorForEnrollment(index) {
  hideMfaEnroll();
  // Authn
  if (!config.useInteractionCodeFlow) {
    return selectMfaFactorForEnrollmentAuthn(index);
  }

  // IDX
  const authenticator = appState.transaction.nextStep.options[index].value;
  authClient.idx.authenticate({ authenticator })
    .then(handleTransaction)
    .catch(showError);
}
window._selectMfaFactorForEnrollment = bindClick(selectMfaFactorForEnrollment);

function selectMfaFactorForEnrollmentAuthn(index) {
  const factor = appState.transaction.factors[index];
  updateAppState({ factor });

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return selectQuestionForEnrollmentAuthn();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return showEnrollPhone();
  }

  // Default logic - this may not work for all factor types
  factor.enroll()
    .then(handleTransaction)
    .catch(showError);
}

function submitEnroll() {
  const factor = appState.factor;

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return enrollQuestion();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return enrollPhone();
  }

  throw new Error(`TODO: add support for enrolling in factorType: ${factor.factorType}`);
}

// authenticator-enrollment-data (IDX)
function showAuthenticatorEnrollmentData() {
  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    showMfaEnroll();
    showEnrollPhone(); // enter phone number
    showAuthenticatorVerificationData(); // select methodType
    return;
  }
  throw new Error(`TODO: handle authenticator-enrollmentt-data for authenticator type ${authenticator.type}`);
}

function submitAuthenticatorEnrollmentData() {
  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    return submitAuthenticatorEnrollmentDataPhone();
  }
  throw new Error(`TODO: handle submit authenticator-enrollment-data for authenticator type ${authenticator.type}`);
}
// After an MFA factor has been selected for enrollment, there may be additional steps to activate the factor
function showMfaEnrollActivate() {
  document.getElementById('mfa-enroll-activate').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Activate an MFA factor';
  showPrevMfa();
  const factor = appState.transaction.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return showActivateOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return showActivatePhone();
  }

  throw new Error(`TODO: handle MFA_ENROLL_ACTIVATE for factorType ${factor.factorType}`);
}

function hideMfaEnrollActivate() {
  document.getElementById('mfa-enroll-activate').style.display = 'none';
  hideActivateOktaVerify();
  hideActivatePhone();
}

function submitEnrollActivate() {
  const factor = appState.transaction.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return submitActivateOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return submitActivatePhone();
  }

  throw new Error(`TODO: handle submit enroll activate for factorType ${factor.factorType}`);
}



function hideActivateOktaVerify() {
  document.getElementById('mfa-enroll-activate-okta-verify').style.display = 'none';
}

function showActivateOktaVerify() {
  showSubmitMfa();
  document.querySelector('#mfa .header').innerText = 'Okta Verify';
  const factor = appState.transaction.factor;
  const qrcode = factor.activation.qrcode;
  const containerElem = document.getElementById('mfa-enroll-activate-okta-verify');
  containerElem.style.display = 'block';
  const imgFrame = document.querySelector('#mfa-enroll-activate-okta-verify .qrcode');
  imgFrame.innerHTML = '';
  const img = document.createElement('img');
  img.setAttribute('src', qrcode.href);
  imgFrame.appendChild(img);
}

function submitActivateOktaVerify() {
  hideMfa();
  const passCode = document.querySelector('#mfa-enroll-activate-okta-verify input[name=passcode]').value;
  appState.transaction.activate({ passCode })
    .then(handleTransaction)
    .catch(showError);
}

// authenticator-verification-data (IDX)
function hideAuthenticatorVerificationData() {
  document.getElementById('authenticator-verification-data').style.display = 'none';
  hideAuthenticatorVerificationDataPhone();
}

function showAuthenticatorVerificationData() {
  document.getElementById('authenticator-verification-data').style.display = 'block';
  showCancelMfa();

  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    return showAuthenticatorVerificationDataPhone();
  }

  throw new Error(`TODO: handle authenticator-verification-data for authenticator type ${authenticator.type}`);
}

function submitAuthenticatorVerificationData() {
  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    return submitAuthenticatorVerificationDataPhone();
  }
  throw new Error(`TODO: handle submit authenticator-verification-data for authenticator type ${authenticator.type}`);
}

function hideAuthenticatorVerificationDataPhone() {
  document.getElementById('authenticator-verification-data-phone').style.display = 'none';
}

function showAuthenticatorVerificationDataPhone() {
  showSubmitMfa();
  document.getElementById('authenticator-verification-data-phone').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Phone/SMS';
  const selectElem = document.querySelector('#authenticator-verification-data-phone select[name=methodType]');
  const options = appState.transaction.nextStep.options;
  options.forEach(function(option) {
    const el = document.createElement('option');
    el.setAttribute('value', option.value);
    el.innerText = option.label;
    selectElem.appendChild(el);
  });
}

function submitAuthenticatorVerificationDataPhone() {
  hideMfa();
  const methodType = document.querySelector('#authenticator-verification-data-phone select[name=methodType]').value;
  authClient.idx.authenticate({ methodType })
    .then(handleTransaction)
    .catch(showError);
}
// Show a list of enrolled MFA factors. The user can select which factor they want to use for verification.
function showMfaRequired() {
  document.getElementById('mfa-required').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'MFA is required';
  showCancelMfa();
  showMfaRequiredFactors();
}

function hideMfaRequired() {
  document.getElementById('mfa-required').style.display = 'none';
  hideMfaRequiredFactors();
}

function showMfaRequiredFactors() {
  const containerElement = document.getElementById('mfa-required-factors');
  containerElement.style.display = 'block';
  const names = listMfaFactors();
  names.forEach(function(name, index) {
    const el = document.createElement('div');
    el.setAttribute('id', `verify-factor-${index}`);
    el.setAttribute('class', `factor`);
    el.innerHTML = `
      <span>${name}</span>
      <a href="#" onclick="_selectMfaFactorForVerification(event, ${index})">Verify</a>
    `;
    containerElement.appendChild(el);
  });
}

function hideMfaRequiredFactors() {
  const containerElement = document.getElementById('mfa-required-factors');
  containerElement.style.display = 'none';
  containerElement.innerHTML = '';
}

function selectMfaFactorForVerification(index) {
  hideMfaRequired();
  // Authn
  if (!config.useInteractionCodeFlow) {
    return selectMfaFactorForVerificationAuthn(index);
  }

  const authenticator = appState.transaction.nextStep.options[index].value;
  authClient.idx.proceed({ authenticator })
    .then(handleTransaction)
    .catch(showError);
}
window._selectMfaFactorForVerification = bindClick(selectMfaFactorForVerification);

function selectMfaFactorForVerificationAuthn(index) {
  const factor = appState.transaction.factors[index];
  updateAppState({ factor });
  showMfaChallenge(); // transition to MFA_CHALLENGE state
}

function submitMfaRequired() {
  // Presumably, user has selected an MFA factor and the appropriate challenge view is showing.
  return submitChallenge();
}
// Prompts the user to enter a value to satisfy an MFA factor challenge
function showMfaChallenge() {
  document.getElementById('mfa-challenge').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'MFA challenge';
  showPrevMfa();

  // Authn
  if (!config.useInteractionCodeFlow) {
    return showMfaChallengeAuthn();
  }

  const authenticator = appState.transaction.nextStep.authenticator;
  
  // Phone/SMS
  if (authenticator.type === 'phone') {
    return showChallengePhone();
  }

  // Security Question
  if (authenticator.type === 'security_question') {
    return showChallengeQuestion();
  }

  // Email
  if (authenticator.type === 'email') {
    return showChallengeEmail();
  }
}

function showMfaChallengeAuthn() {
  const factor = appState.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return showChallengeOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return showChallengePhone();
  }

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return showChallengeQuestion();
  }

  throw new Error(`TODO: handle MFA_CHALLENGE for factorType ${factor.factorType}`);
}

function hideMfaChallenge() {
  document.getElementById('mfa-challenge').style.display = 'none';
  hideChallengeOktaVerify();
  hideChallengePhone();
  hideChallengeQuestion();
  hideChallengeEmail();
}

function submitChallenge() {
  const factor = appState.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return submitChallengeOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return submitChallengePhone();
  }

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return submitChallengeQuestion();
  }

  throw new Error(`TODO: handle submit MFA_CHALLENGE for factorType ${factor.factorType}`);
}


// challenge-authenticator (IDX)
function submitChallengeAuthenticator() {
  const authenticator = appState.transaction.nextStep.authenticator;
  
  // Phone/SMS
  if (authenticator.type === 'phone') {
    return submitChallengePhone();
  }

  // Security Question
  if (authenticator.type === 'security_question') {
    return submitChallengeQuestion();
  }

  // Email
  if (authenticator.type === 'email') {
    return submitChallengeEmail();
  }

  throw new Error(`TODO: handle submit challenge-authenticator for authenticator type ${authenticator.type}`);
}
function showRecoverPassword() {
  // Copy username from login form to recover password form
  let username;
  if (config.useDynamicForm && config.useInteractionCodeFlow) {
    username = document.querySelector('#dynamic-signin-form input[name=username]').value;
  } else {
    username = document.querySelector('#static-signin-form input[name=username]').value;
  }
  document.querySelector('#recover-password-form input[name=recover-username]').value = username;

  hideSigninForm();
  document.getElementById('recover-password-form').style.display = 'block';
}
window._showRecoverPassword = bindClick(showRecoverPassword);

function hideRecoverPassword() {
  document.querySelector('#recover-password-form input[name=recover-username]').value = '';
  document.getElementById('recover-password-form').style.display = 'none';
}

function submitRecoverPasswordForm() {
  const username = document.querySelector('#recover-password-form input[name=recover-username]').value;
  hideRecoverPassword();
  
  // Authn
  if (!config.useInteractionCodeFlow) {
    // Supported factor types are  `SMS`, `EMAIL`, or `CALL`. This must be specified up-front.
    const factorType = 'email';
    return authClient.forgotPassword({ username, factorType })
      .then(handleTransaction)
      .catch(showError);
  }

  // IDX
  // If `authenticator` is not specified up-front, the user will be able to choose from a list
  const authenticator = 'email'; // TODO: this is not working as expected, list is still shown
  return authClient.idx.recoverPassword({ username, authenticator })
    .then(handleTransaction)
    .catch(showError);
}
window._submitRecoverPasswordForm = bindClick(submitRecoverPasswordForm);

function showRecoveryChallenge() {
  document.getElementById('recovery-challenge').style.display = 'block';
}

function hideRecoveryChallenge() {
  document.getElementById('recovery-challenge').style.display = 'none';
}

function showNewPasswordForm() {
  document.getElementById('new-password-form').style.display = 'block';
  showSubmitMfa();
  showCancelMfa();
}

function hideNewPasswordForm() {
  document.getElementById('new-password-form').style.display = 'none';
  document.querySelector('#new-password-form input[name=new-password').value = '';
}

function submitNewPasswordForm() {
  const password = document.querySelector('#new-password-form input[name=new-password').value;
  hideNewPasswordForm();
  return authClient.idx.recoverPassword({ password })
    .then(handleTransaction)
    .catch(showError);

}
window._submitNewPasswordForm = bindClick(submitNewPasswordForm);
function showChallengeEmail() {
  document.getElementById('mfa-challenge-email').style.display = 'block';
  showSubmitMfa();
}

function hideChallengeEmail() {
  document.getElementById('mfa-challenge-email').style.display = 'none';
  document.querySelector('#mfa-challenge-email input[name=passcode]').value = '';
}

function submitChallengeEmail() {
  const passCode = document.querySelector('#mfa-challenge-email input[name=passcode]').value;
  hideMfa();

  // IDX
  // email can be used for authentication or recovery
  authClient.idx.proceed({ verificationCode: passCode })
  .then(handleTransaction)
  .catch(showError);
}
function showChallengeOktaVerify() {
  document.getElementById('mfa-challenge-okta-verify').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Okta Verify';
  showSubmitMfa();
}

function hideChallengeOktaVerify() {
  document.getElementById('mfa-challenge-okta-verify').style.display = 'none';
}

function submitChallengeOktaVerify() {
  hideMfa();
  const passCode = document.querySelector('#mfa-challenge-okta-verify input[name=passcode]').value;
  appState.transaction.verify({ passCode })
    .then(handleTransaction)
    .catch(showError);
}
// Enroll factor: Phone/SMS
function hideEnrollPhone() {
  document.getElementById('mfa-enroll-phone').style.display = 'none';
}

function showEnrollPhone() {
  showMfaEnroll();
  showSubmitMfa();
  document.querySelector('#mfa .header').innerText = 'Phone/SMS';
  document.getElementById('mfa-enroll-phone').style.display = 'block';
}

function enrollPhone() {
  hideMfa();
  const phoneNumber = document.querySelector('#mfa-enroll-phone input[name=phone]').value;
  const factor = appState.factor;
  factor.enroll({
    profile: {
      phoneNumber,
      updatePhone: true
    }
  })
    .then(handleTransaction)
    .catch(showError);
}


// Phone: MFA_ENROLL_ACTIVATE
function hideActivatePhone() {
  document.getElementById('mfa-enroll-activate-phone').style.display = 'none';
}

function showActivatePhone() {
  showSubmitMfa();
  document.querySelector('#mfa .header').innerText = 'Phone/SMS';
  document.getElementById('mfa-enroll-activate-phone').style.display = 'block';
}

function submitActivatePhone() {
  hideMfa();
  const passCode = document.querySelector('#mfa-enroll-activate-phone input[name=passcode]').value;
  appState.transaction.activate({ passCode })
    .then(handleTransaction)
    .catch(showError);
}

function showChallengePhone() {
  document.getElementById('mfa-challenge-phone').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Phone/SMS';
  showSubmitMfa();
}

function hideChallengePhone() {
  document.getElementById('mfa-challenge-phone').style.display = 'none';
}

function submitChallengePhone() {
  hideMfa();
  const passCode = document.querySelector('#mfa-challenge-phone input[name=passcode]').value;

  if (!config.useInteractionCodeFlow) {
    // Authn
    return appState.transaction.verify({ passCode })
      .then(handleTransaction)
      .catch(showError);
  }

  // IDX
  authClient.idx.authenticate({ verificationCode: passCode })
    .then(handleTransaction)
    .catch(showError);
}

// IDX
function submitAuthenticatorEnrollmentDataPhone() {
  hideMfa();
  const methodType = document.querySelector('#authenticator-verification-data-phone select[name=methodType]').value;
  const phoneNumber = document.querySelector('#mfa-enroll-phone input[name=phone]').value;
  authClient.idx.authenticate({ methodType, phoneNumber })
    .then(handleTransaction)
    .catch(showError);
}// Factor: Security Question

function selectQuestionForEnrollmentAuthn() {
  const factor = appState.factor;
  return factor.questions().then(function(questions) {
    updateAppState({ questions });
    showEnrollQuestion();
  });
}

function hideEnrollQuestion() {
  document.getElementById('mfa-enroll-question').style.display = 'none';
  document.querySelector('#mfa-enroll-question select[name=questions]').innerHTML = '';
}

function showEnrollQuestion() {
  showMfaEnroll();
  showSubmitMfa();
  document.querySelector('#mfa .header').innerText = 'Security Question';
  document.getElementById('mfa-enroll-question').style.display = 'block';
  const questions = appState.questions;
  const selectElem = document.querySelector('#mfa-enroll-question select[name=questions]');
  questions.forEach(function(question) {
    const el = document.createElement('option');
    el.setAttribute('value', question.question);
    el.innerText = question.questionText;
    selectElem.appendChild(el);
  });
}

function enrollQuestion() {
  const question = document.querySelector('#mfa-enroll-question select[name=questions]').value;
  const answer = document.querySelector('#mfa-enroll-question input[name=answer]').value;
  const factor = appState.factor;
  hideMfa();
  factor.enroll({
    profile: {
      question,
      answer
    }
  })
    .then(handleTransaction)
    .catch(showError);
}

function getVerifyQuestionText() {
    // Authn
    if (!config.useInteractionCodeFlow) {
      return appState.factor.profile.questionText;
    }
  // IDX
  return appState.transaction.nextStep.authenticator.profile.question;
}

function showChallengeQuestion() {
  showSubmitMfa();
  document.getElementById('mfa-challenge-question').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Security Question';
  const questionText = getVerifyQuestionText();
  document.querySelector('#mfa-challenge-question .question').innerText = questionText;
}

function hideChallengeQuestion() {
  document.getElementById('mfa-challenge-question').style.display = 'none';
}

function submitChallengeQuestion() {
  hideMfa();
  const answer = document.querySelector('#mfa-challenge-question input[name=answer]').value;

  // Authn
  if (!config.useInteractionCodeFlow) {
    return appState.factor.verify({
      answer
    })
      .then(handleTransaction)
      .catch(showError);
  }

  // IDX
  const questionKey = appState.transaction.nextStep.authenticator.profile.questionKey;
  authClient.idx.authenticate({ credentials: { questionKey, answer } })
    .then(handleTransaction)
    .catch(showError);
}
