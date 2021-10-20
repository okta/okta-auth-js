function showRecoverPassword() {
  // Copy username from login form to recover password form
  const username = document.querySelector('#login-form input[name=username]').value;
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
  
  {{#if authn}}
  // Authn
  if (!config.useInteractionCodeFlow) {
    // Supported factor types are  `SMS`, `EMAIL`, or `CALL`. This must be specified up-front.
    const factorType = 'email';
    return authClient.forgotPassword({ username, factorType })
      .then(handleTransaction)
      .catch(showError);
  }
  {{/if}}

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
