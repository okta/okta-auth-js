// Sample SPA application
var authClient;
var appState = {};
{{> spa/util.js }}
{{> spa/config.js }}

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
  
  {{#if emailVerify}}
  if (authClient.idx.isEmailVerifyCallback(window.location.search)) {
    return authClient.idx.parseEmailVerifyCallback(window.location.search).then(function(res) {
      switch (config.authMethod) {
        {{#if signinWidget}}
        case 'widget':
          showSigninWidget(res);
          break;
        {{/if}}
        {{#if signinForm}}
        case 'form':
          showSigninForm(res);
          break;
        {{/if}}
        default:
          throw new Error(`Email verify callback can not be used with authMethod: ${config.authMethod}`);
          break;
      }
    });
  }
  {{/if}}

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
    {{#if signinWidget}}
    case 'widget':
      showSigninWidget();
      break;
    {{/if}}
    {{#if signinForm}}
    case 'form':
      showSigninForm();
      break;
    {{/if}}
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

{{> spa/authMethod/redirect.js }}

{{#if signinWidget}}
{{> spa/authMethod/widget.js }}
{{/if}}

{{#if signinForm}}
{{> spa/authMethod/direct/basic.js }}
{{/if}}

{{#if mfa}}
{{> spa/authMethod/direct/mfa.js }}
{{/if}}
