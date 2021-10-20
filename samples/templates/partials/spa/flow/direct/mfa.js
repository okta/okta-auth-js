{{#if authn}}
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
{{/if}}

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
  {{#if authn}}
  hideMfaEnrollActivate();
  hideMfaRequired();
  {{/if}}
  hideMfaChallenge();
  hideAuthenticatorVerificationData();
}

function showMfa() {
  document.getElementById('mfa').style.display = 'block';
  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    return showMfaAuthn();
  }
  {{/if}}

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

{{#if authn}}
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
{{/if}}

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
  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    // https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#cancel
    return appState.transaction.cancel().finally(resetMfa);
  }
  {{/if}}

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
  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    // End current factor enrollment and return to MFA_ENROLL.
    // https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#prev
    return appState.transaction.prev()
      .then(handleTransaction)
      .catch(showError);
  }
  {{/if}}

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
  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    return submitMfaAuthn();
  }
  {{/if}}

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

{{#if authn}}
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
{{/if}}

function listMfaFactors() {
  const transaction = appState.transaction;
  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    // Authn
    return transaction.factors.map(factor => factorName(factor));
  }
  {{/if}}

  // IDX
  return transaction.nextStep.options.map(option => option.label);
}

{{> spa/flow/direct/mfa_enroll.js }}
{{> spa/flow/direct/mfa_activate.js }}
{{> spa/flow/direct/mfa_required.js }}
{{> spa/flow/direct/mfa_challenge.js }}
{{> spa/flow/direct/factors/password.js }}
{{> spa/flow/direct/factors/email.js }}
{{> spa/flow/direct/factors/okta_verify.js }}
{{> spa/flow/direct/factors/phone.js }}
{{> spa/flow/direct/factors/question.js }}
