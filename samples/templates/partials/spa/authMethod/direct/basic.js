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
    case 'PENDING':
      if (transaction.nextStep.name === 'identify') {
        renderDynamicSigninForm(transaction);
        break;
      }
      {{#if mfa}}
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
