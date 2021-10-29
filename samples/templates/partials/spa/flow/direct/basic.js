function resumeTransaction(options) {
  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    // Authn
    if (authClient.tx.exists()) {
      return authClient.tx.resume()
        .then(handleTransaction)
        .catch(showError);
    }
    return;
  }
  {{/if}}

  if (authClient.transactionManager.exists()) {
    // TODO: we may be in either authenticate or recoverPassword flow
    // ExpressJS sample uses "idxMethod" in persistent storage to workaround not knowing which flow we are on
    // Here we assume we are resuming an authenticate flow, but this could be wrong.
    return authClient.idx.authenticate(options)
      .then(handleTransaction)
      .catch(showError);
  }
}

function showSigninForm(options) {
  hideRecoveryChallenge();
  hideNewPasswordForm();

  // Is there an existing transaction we can resume?
  if (resumeTransaction(options)) {
    return;
  }

  document.getElementById('login-form').style.display = 'block';
}
window._showSigninForm = bindClick(showSigninForm);

function hideSigninForm() {
  document.getElementById('login-form').style.display = 'none';
}

function submitSigninForm() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    // Authn
    return authClient.signIn({ username, password })
      .then(handleTransaction)
      .catch(showError);
  }
  {{/if}}

  return authClient.idx.authenticate({ username, password })
    .then(handleTransaction)
    .catch(showError);

}
window._submitSigninForm = bindClick(submitSigninForm);

function handleTransaction(transaction) {
  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    // Authn
    return handleTransactionAuthn(transaction);
  }
  {{/if}}

  // IDX
  if (transaction.messages) {
    showError(transaction.messages);
  }

  switch (transaction.status) {
    {{#if mfa}}
    case 'PENDING':
      hideSigninForm();
      updateAppState({ transaction });
      showMfa();
      break;
    {{/if}}
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
  {{#if mfa}}
    case 'MFA_ENROLL':
    case 'MFA_REQUIRED':
    case 'MFA_ENROLL_ACTIVATE':
    case 'MFA_CHALLENGE':
      hideSigninForm();
      updateAppState({ transaction });
      showMfa();
      return;
  {{/if}}
    default:
      throw new Error('TODO: add handling for ' + transaction.status + ' status');
  }
}
