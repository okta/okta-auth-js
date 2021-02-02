// @ts-nocheck
/* global OktaAuth , OktaSignIn */

'use strict';

// Begin sample SPA application

// Default config. Properties here match the names of query parameters in the URL
var config = {
  issuer: '',
  clientId: '',
  scopes: 'openid email',
  storage: 'sessionStorage',
  requireUserSession: 'true',
  flow: 'redirect'
};

var authClient;
var userInfo;

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

function stringify(obj) {
  // Convert false/undefined/null into "null"
  if (!obj) {
    return 'null';
  }
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

  // Subscribe to authState change event. Logic based on authState is done here.
  authClient.authStateManager.subscribe(function(authState) {
    if (!authState.isAuthenticated) {
      // If not authenticated, reset values related to user session
      userInfo = null;
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
  // Calculate initial auth state and fire change event for listeners
  authClient.authStateManager.updateAuthState();
}

function renderApp() {
  const authState = authClient.authStateManager.getAuthState();
  document.getElementById('authState').innerText = stringify(authState);

  // If auth state is "pending", render in the loading state
  if (authState.isPending) {
    return renderLoading();
  }

  // Not loading
  document.getElementById('loading').style.display = 'none';

  if (authState.isAuthenticated) {
    return renderAuthenticated(authState);
  }

  // Default: Unauthenticated state
  return renderUnauthenticated();
}

function renderLoading() {
  document.getElementById('loading').style.display = 'block';
}

function renderAuthenticated(authState) {
  document.getElementById('auth').style.display = 'block';
  document.getElementById('accessToken').innerText = stringify(authState.accessToken);
  document.getElementById('userInfo').innerText = stringify(userInfo || authState.userInfo);
}

function renderUnauthenticated() {
  // The user is not authenticated, the app will begin an auth flow.
  document.getElementById('auth').style.display = 'none';

  // Unauthenticated state, begin an auth flow
  return beginAuthFlow();
}

function handleLoginRedirect() {
  // The URL contains a code, `parseFromUrl` will exchange the code for tokens
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
      userInfo = value;
      renderApp();
    })
    .catch(function (error) {
      // This is expected when Okta SSO does not exist
      showError(error);
    });
}

// called when the "renew token" link is clicked
function renewToken() {
  // when the token is written to storage, the authState will change and we will re-render.
  return authClient.tokenManager.renew('accessToken')
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

function endAuthFlow(tokens) {
  // parseFromUrl clears location.search. There may also be a leftover "error" param from the auth flow.
  // Replace state with the canonical app uri so the page can be reloaded cleanly.
  history.replaceState(null, '', config.appUri);

  // Store tokens. This will update the auth state and we will re-render
  authClient.tokenManager.setTokens(tokens);
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
      useInteractionCodeFlow: config.useInteractionCodeFlow,
      authParams: {
        issuer: config.issuer,
        state: JSON.stringify(config.state),
      }
    });
  
    signIn.showSignInToGetTokens({
      el: '#signin-widget'
    })
    .then(function(tokens) {
      document.getElementById('flow-widget').style.display = 'none';
      signIn.remove();
      endAuthFlow(tokens);
    })
    .catch(function(error) {
      console.log('login error', error);
    });
  
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

function shouldRedirectToGetTokens(authState) {
  if (authState.isAuthenticated || authState.isPending) {
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

function logout(e) {
  e.preventDefault();
  userInfo = null;
  authClient.signOut();
}

function createAuthClient() {
  // The `OktaAuth` constructor can throw if the config is malformed
  try {
    authClient = new OktaAuth({
      issuer: config.issuer,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scopes: config.scopes.split(/\s+/),
      tokenManager: {
        storage: config.storage
      },
      transformAuthState
    });
  } catch (error) {
    return showError(error);
  }
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
      return userInfo || authClient.token.getUserInfo();
    }).then(function(value) {
      userInfo = value;
      authState.isAuthenticated = authState.isAuthenticated && !!userInfo;
      return authState;
    });
  }

  return promise;
}

function showForm() {
  // Set values from config
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('clientId').value = config.clientId;
  document.getElementById('scopes').value = config.scopes;
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

  if (config.useInteractionCodeFlow) {
    document.getElementById('useInteractionCodeFlow-on').checked = true;
  } else {
    document.getElementById('useInteractionCodeFlow-off').checked = true;
  }
  // Show the form
  document.getElementById('config-form').style.display = 'block'; // show form
}

function showError(error) {
  console.error(error);
  var node = document.createElement('DIV');
  node.innerText = JSON.stringify(error, null, 2);
  document.getElementById('error').appendChild(node);
}

/* eslint-disable max-statements,complexity */
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
  var storage;
  var flow;
  var requireUserSession;
  var scopes;
  var useInteractionCodeFlow;

  var state;
  if (stateParam) {
    // Read from state
    state = JSON.parse(stateParam);
    issuer = state.issuer;
    clientId = state.clientId;
    storage = state.storage;
    flow = state.flow;
    requireUserSession = state.requireUserSession;
    scopes = state.scopes;
    useInteractionCodeFlow = state.useInteractionCodeFlow;
  } else {
    // Read from URL
    issuer = url.searchParams.get('issuer') || config.issuer;
    clientId = url.searchParams.get('clientId') || config.clientId;
    storage = url.searchParams.get('storage') || config.storage;
    flow = url.searchParams.get('flow') || config.flow;
    requireUserSession = url.searchParams.get('requireUserSession') ? 
      url.searchParams.get('requireUserSession')  === 'true' : config.requireUserSession;
    scopes = url.searchParams.get('scopes') || config.scopes;
    useInteractionCodeFlow = url.searchParams.get('useInteractionCodeFlow') === 'true' || config.useInteractionCodeFlow;
  }
  // Create a canonical app URI that allows clean reloading with this config
  appUri = window.location.origin + '/' +
    '?issuer=' + encodeURIComponent(issuer) +
    '&clientId=' + encodeURIComponent(clientId) +
    '&storage=' + encodeURIComponent(storage) + 
    '&requireUserSession=' + encodeURIComponent(requireUserSession) + 
    '&flow=' + encodeURIComponent(flow) +
    '&scopes=' + encodeURIComponent(scopes) +
    '&useInteractionCodeFlow=' + encodeURIComponent(useInteractionCodeFlow);
  
  // Add all app options to the state, to preserve config across redirects
  state = {
    issuer,
    clientId,
    storage,
    requireUserSession,
    flow,
    scopes,
    useInteractionCodeFlow
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
