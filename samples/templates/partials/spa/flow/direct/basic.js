function resumeTransaction() {
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
    return authClient.idx.authenticate()
      .then(handleTransaction)
      .catch(showError);
  }
}

function showSigninForm() {
  // Is there an existing transaction we can resume?
  if (resumeTransaction()) {
    return;
  }

  document.getElementById('login-form').style.display = 'block';
}

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
