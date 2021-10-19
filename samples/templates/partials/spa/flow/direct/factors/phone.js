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

{{#if authn}}
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
{{/if}}


{{#if authn}}
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
{{/if}}

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

  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    // Authn
    return appState.transaction.verify({ passCode })
      .then(handleTransaction)
      .catch(showError);
  }
  {{/if}}

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
}