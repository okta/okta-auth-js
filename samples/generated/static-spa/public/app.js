// @ts-nocheck
/* global OktaAuth , OktaSignIn */

'use strict';

// Begin sample SPA application

// Default config. Properties here match the names of query parameters in the URL
var config = {
  issuer: '',
  clientId: '',
  storage: 'sessionStorage',
  requireUserSession: true,
  flow: 'redirect'
};
var authClient;

// bind methods called from HTML
function bindClick(method, args) {
  return function(e) {
    e.preventDefault();
    method.apply(null, args);
    return false;
  };
}
window._logout = logout;
window._loginRedirect = bindClick(redirectToLogin);
window._getUserInfo = bindClick(getUserInfo);
window._renewToken = bindClick(renewToken);
window._submitSigninForm = bindClick(submitSigninForm);

function formatJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

// load config from the URL params
loadConfig();

// start all the things
main();

function main() {
  // Configuration is loaded from URL query params. If the config is not valid, show a form to set the values in the URL
  var hasValidConfig = !!(config.issuer && config.clientId);
  if (!hasValidConfig || config.showForm) {
    showForm();
    return;
  }

  // Have valid config. Update UI
  document.getElementById('home-link').setAttribute('href', config.appUri);
  document.getElementById('options-link').setAttribute('href', config.appUri + '&showForm=true');

  createAuthClient();

  // During the OIDC auth flow, the app will receive a code passed to the `redirectUri`
  // This event occurs *in the middle* of an authorization flow
  // The callback handler logic should happen *before and instead of* any other auth logic
  // In most apps this callback will be handled by a special route
  // For SPA apps like this, with no routing or hash-based routing, the callback is handled in the main function
  if (authClient.token.isLoginRedirect()) {
    return handleLoginRedirect();
  }

  // Normal app startup
  renderApp();
}

function renderApp() {
  return getAuthState().then(function(authState) {
    document.getElementById('authState').innerText = formatJSON(authState);
    if (authState.isAuthenticated) {
      // User is authenticated. Update UI
      document.getElementById('accessToken').innerText = formatJSON(authState.tokens.accessToken);
      document.getElementById('userInfo').innerText = formatJSON(authState.userInfo);
      document.getElementById('auth').style.display = 'block';
      return;
    }

    // The user is not authenticated, the app will begin an auth flow.

    // Special handling for memory-based token storage.
    // There will be a redirect on each page load to acquire fresh tokens.
    if (!authState.hasTokens && (config.storage === 'memory' || config.getTokens)) {

      // Callback from Okta triggered by `redirectToGetTokens`
      // If the callback has errored, it means there is no Okta session and we should begin a new auth flow
      if (config.error === 'login_required') {
        return beginAuthFlow();
      }

      // Call Okta to get tokens. Okta will redirect back to this app
      // The callback is handled by `handleLoginRedirect` which will call `renderApp` again
      return redirectToGetTokens();
    }

    // Unauthenticated state
    return beginAuthFlow();
  });
}

// Async function, gathers all information into a unique object for synchronous use. May become out-of-date.
function getAuthState() {
  var authState = {
    isAuthenticated: false,
    hasTokens: false,
    userInfo: null,
    tokens: null
  };
  return getTokens().then(function(tokens) {
    authState.tokens = tokens;
    authState.hasTokens = !!(tokens.idToken && tokens.accessToken);

     if (config.requireUserSession) {
       // checking `hasTokens` before calling getUserInfo API avoids unnecessary calls
       if (authState.hasTokens) {
        return getUserInfo().then(function(userInfo) {
          authState.userInfo = userInfo;
        });
       }
    }
  }).then(function() {
    authState.isAuthenticated = config.requireUserSession ? !!authState.userInfo : authState.hasTokens;
    return authState;
  });
}

function handleLoginRedirect() {
  // The URL contains a code, `parseFromUrl` will exchange the code for tokens
  authClient.token.parseFromUrl().then(function (res) {
    endAuthFlow(res); // save tokens
  }).catch(function(error) {
    showError(error);
  });
}

function getTokens() {
  return Promise.all([
    authClient.tokenManager.get('idToken'),
    authClient.tokenManager.get('accessToken')
  ])
  .then(function (values) {
    const tokens = {};
    tokens.idToken = values[0];
    tokens.accessToken = values[1];
    return tokens;
  });
}

function getUserInfo() {
  return authClient.token.getUserInfo()
    .then(function(userInfo) {
      document.getElementById('userInfo').innerText = formatJSON(userInfo);
      return userInfo;
    })
    .catch(function (error) {
      // This is expected when Okta SSO does not exist
      showError(error);
      return false;
    });
}

function renewToken() {
  return authClient.tokenManager.renew('accessToken')
    .then(function(accessToken) {
      document.getElementById('accessToken').innerText = formatJSON(accessToken);
    })
    .catch(function(error) {
      showError(error);
    });
}

function beginAuthFlow() {
  switch (config.flow) {
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

function endAuthFlow(res) {
  // parseFromUrl clears location.search. There may also be a leftover "error" param from the auth flow.
  // Replace state with the canonical app uri so the page can be reloaded cleanly.
  history.replaceState(null, '', config.appUri);

  // Store tokens
  authClient.tokenManager.add('idToken', res.tokens.idToken);
  authClient.tokenManager.add('accessToken', res.tokens.accessToken);

  // Normal app startup
  renderApp();
}

function showRedirectButton() {
  document.getElementById('flow-redirect').style.display = 'block';
}

function showSigninWidget() {
    // Create an instance of the signin widget
    var signIn = new OktaSignIn({
      baseUrl: config.issuer.split('oauth2')[0],
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      authParams: {
        issuer: config.issuer,
        state: JSON.stringify(config.state),
      }
    });
  
    signIn.renderEl({
        el: '#signin-widget'
      },
      function success(res) {
        console.log('login success', res);
  
        if (res.status === 'SUCCESS') {
          // Hide login UI
          document.getElementById('flow-widget').style.display = 'none';
          signIn.remove();
          endAuthFlow(res);
        }
      },
      function error(err) {
        console.log('login error', err);
      }
    );
  
    document.getElementById('flow-widget').style.display = 'block'; // show login UI
}

function showSigninForm() {
  document.getElementById('flow-form').style.display = 'block';
}

function submitSigninForm() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  authClient.signIn({
    username,
    password
  })
  .then(function(transaction) {
    if (transaction.status === 'SUCCESS') {
      return authClient.session.setCookieAndRedirect(transaction.sessionToken, config.appUri + '&getTokens=true');
    }
    throw new Error('We cannot handle the ' + transaction.status + ' status');
  })
  .catch(function(err) {
    showError(err);
  });
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
  authClient.token.getWithRedirect(Object.assign({
    state: JSON.stringify(config.state)
  }, additionalParams));
}

function logout(e) {
  e.preventDefault();
  authClient.signOut();
}

function createAuthClient() {
  // The `OktaAuth` constructor can throw if the config is malformed
  try {
    authClient = new OktaAuth({
      issuer: config.issuer,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      tokenManager: {
        storage: config.storage
      }
    });
  } catch (error) {
    return showError(error);
  }
}

function showForm() {
  // Set values from config
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('clientId').value = config.clientId;
  try {
    document.querySelector(`#flow [value="${config.flow || ''}"]`).selected = true;
  } catch (e) { showError(e); }
  if (config.requireUserSession) {
    document.getElementById('requireUserSession-on').checked = true;
  } else {
    document.getElementById('requireUserSession-off').checked = true;
  }
  try {
    document.querySelector(`#storage [value="${config.storage || ''}"]`).selected = true;
  } catch (e) { showError(e); }

  // Show the form
  document.getElementById('config-form').style.display = 'block'; // show form
}

function showError(error) {
  console.error(error);
  var node = document.createElement('DIV');
  node.innerText = JSON.stringify(error, null, 2);
  document.getElementById('error').appendChild(node);
}

/* eslint-disable max-statements */
function loadConfig() {
  // Read all config from the URL
  var url = new URL(window.location.href);
  var redirectUri = window.location.origin + '/implicit/callback'; // Should also be set in Okta Admin UI
  
  // Params which are not in the state
  var stateParam = url.searchParams.get('state');
  var error = url.searchParams.get('error');
  var showForm = url.searchParams.get('showForm');
  var getTokens = url.searchParams.get('getTokens');

  // Params which are encoded into the state
  var issuer;
  var clientId;
  var appUri;
  var state;
  var storage;
  var flow;
  var requireUserSession;

  if (stateParam) {
    // Read from state
    state = JSON.parse(stateParam);
    issuer = state.issuer;
    clientId = state.clientId;
    storage = state.storage;
    flow = state.flow;
    requireUserSession = state.requireUserSession;
  } else {
    // Read from URL
    issuer = url.searchParams.get('issuer') || config.issuer;
    clientId = url.searchParams.get('clientId') || config.clientId;
    storage = url.searchParams.get('storage') || config.storage;
    flow = url.searchParams.get('flow') || config.flow;
    requireUserSession = url.searchParams.get('requireUserSession') ? 
      url.searchParams.get('requireUserSession')  === 'true' : config.requireUserSession;
  }
  // Create a canonical app URI that allows clean reloading with this config
  appUri = window.location.origin + '/' +
    '?issuer=' + encodeURIComponent(issuer) +
    '&clientId=' + encodeURIComponent(clientId) +
    '&storage=' + encodeURIComponent(storage) + 
    '&requireUserSession=' + encodeURIComponent(requireUserSession) + 
    '&flow=' + encodeURIComponent(flow);
  
  // Add all app options to the state, to preserve config across redirects
  state = {
    issuer,
    clientId,
    storage,
    requireUserSession,
    flow
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
    getTokens
  });

  Object.assign(config, newConfig);
  document.getElementById('config').innerText = formatJSON(config);
}
