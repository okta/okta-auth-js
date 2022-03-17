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