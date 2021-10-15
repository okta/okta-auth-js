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
      default:
        throw new Error(`TODO: handle nextStep: ${nextStep.name}`);
    }
  }
}

{{#if authn}}
function showMfaAuthn() {
  const transaction = appState.transaction;
  if (transaction.status === 'MFA_ENROLL') {
    return showMfaEnrollFactors();
  }
  if (transaction.status === 'MFA_ENROLL_ACTIVATE') {
    return showMfaEnrollActivate();
  }
  if (transaction.status === 'MFA_REQUIRED') {
    return showMfaRequired();
  }
  if (transaction.status === 'MFA_CHALLENGE') {
    return showMfaChallenge();
  }
  throw new Error(`TODO: handle transaction status ${appState.transaction.status}`);
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
  throw new Error(`TODO: handle submit for nextStep: ${nextStep.name}`);
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
    return submitVerify();
  }
  if (transaction.status === 'MFA_CHALLENGE') {
    return submitChallenge();
  }
  throw new Error(`TODO: handle submit for transaction status: ${transaction.status}`);
}
{{/if}}

function hideMfaEnroll() {
  document.getElementById('mfa-enroll').style.display = 'none';
  hideMfaEnrollFactors();
  hideEnrollQuestion();
  hideEnrollPhone();
}

function showMfaEnroll() {
  document.getElementById('mfa-enroll').style.display = 'block';
  showCancelMfa();
  document.querySelector('#mfa .header').innerText = 'Enroll in an MFA factor';
}

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

function showMfaEnrollFactors() {
  showMfaEnroll();
  const containerElement = document.getElementById('mfa-enroll-factors');
  containerElement.style.display = 'block';
  const names = listMfaFactors();
  names.forEach(function(name, index) {
    const el = document.createElement('div');
    el.setAttribute('id', `enroll-factor-${index}`);
    el.setAttribute('class', `factor panel`);
    el.innerHTML = `
      <span>${name}</span>
      <a href="#" onclick="_enrollMfaFactor(event, ${index})">Enroll</a>
    `;
    containerElement.appendChild(el);
  });
}

function hideMfaEnrollFactors() {
  const containerElement = document.getElementById('mfa-enroll-factors');
  containerElement.style.display = 'none';
  containerElement.innerHTML = '';
}

function enrollMfaFactor(index) {
  hideMfaEnrollFactors();
  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    return enrollMfaFactorAuthn(index);
  }
  {{/if}}

  const authenticator = appState.transaction.nextStep.options[index].value;
  hideMfa();
  authClient.idx.authenticate({ authenticator })
    .then(handleTransaction)
    .catch(showError);
}
window._enrollMfaFactor = bindClick(enrollMfaFactor);

{{#if authn}}
// MFA_ENROLL https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#mfa_enroll
function enrollMfaFactorAuthn(index) {
  const factor = appState.transaction.factors[index];
  updateAppState({ factor });

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return factor.questions().then(function(questions) {
      updateAppState({ questions });
      showEnrollQuestion();
    });
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return showEnrollPhone();
  }

  // Default logic - this may not work for all factor types
  hideMfa();
  factor.enroll()
    .then(handleTransaction)
    .catch(showError);
}

function submitEnroll() {
  const factor = appState.factor;

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return enrollQuestion();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return enrollPhone();
  }

  throw new Error(`TODO: add support for enrolling in factorType: ${factor.factorType}`);
}
{{/if}}

// Factor: Security Question
function hideEnrollQuestion() {
  document.getElementById('mfa-enroll-question').style.display = 'none';
  document.querySelector('#mfa-enroll-question select[name=questions]').innerHTML = '';
}

function showEnrollQuestion() {
  showSubmitMfa();
  document.querySelector('#mfa .header').innerText = 'Security Question';
  document.getElementById('mfa-enroll-question').style.display = 'block';
  const questions = appState.questions;
  const selectElem = document.querySelector('#mfa-enroll-question select[name=questions]');
  questions.forEach(function(question) {
    const el = document.createElement('option');
    el.setAttribute('value', question.question);
    el.innerText = question.questionText;
    selectElem.appendChild(el);
  });
}

{{#if authn}}
function enrollQuestion() {
  hideMfa();
  const question = document.querySelector('#mfa-enroll-question select[name=questions]').value;
  const answer = document.querySelector('#mfa-enroll-question input[name=answer]').value;
  const factor = appState.factor;
  factor.enroll({
    profile: {
      question,
      answer
    }
  })
    .then(handleTransaction)
    .catch(showError);
}
{{/if}}

// Factor: Phone/SMS
function hideEnrollPhone() {
  document.getElementById('mfa-enroll-phone').style.display = 'none';
}

function showEnrollPhone() {
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
// MFA_ENROLL_ACTIVATE https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#mfa_enroll_activate
function showMfaEnrollActivate() {
  document.getElementById('mfa-enroll-activate').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Activate an MFA factor';
  showPrevMfa();
  const factor = appState.transaction.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return showActivateOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return showActivatePhone();
  }

  throw new Error(`TODO: handle MFA_ENROLL_ACTIVATE for factorType ${factor.factorType}`);
}

function hideMfaEnrollActivate() {
  document.getElementById('mfa-enroll-activate').style.display = 'none';
  hideActivateOktaVerify();
  hideActivatePhone();
}

function submitEnrollActivate() {
  const factor = appState.transaction.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return submitActivateOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return submitActivatePhone();
  }

  throw new Error(`TODO: handle submit enroll activate for factorType ${factor.factorType}`);
}

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

function hideActivateOktaVerify() {
  document.getElementById('mfa-enroll-activate-okta-verify').style.display = 'none';
}

function showActivateOktaVerify() {
  showSubmitMfa();
  document.querySelector('#mfa .header').innerText = 'Okta Verify';
  const factor = appState.transaction.factor;
  const qrcode = factor.activation.qrcode;
  const containerElem = document.getElementById('mfa-enroll-activate-okta-verify');
  containerElem.style.display = 'block';
  const imgFrame = document.querySelector('#mfa-enroll-activate-okta-verify .qrcode');
  imgFrame.innerHTML = '';
  const img = document.createElement('img');
  img.setAttribute('src', qrcode.href);
  imgFrame.appendChild(img);
}

function submitActivateOktaVerify() {
  hideMfa();
  const passCode = document.querySelector('#mfa-enroll-activate-okta-verify input[name=passcode]').value;
  appState.transaction.activate({ passCode })
    .then(handleTransaction)
    .catch(showError);
}
{{/if}}

{{#if authn}}
// MFA_REQUIRED https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#mfa_required
function showMfaRequired() {
  document.getElementById('mfa-required').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'MFA is required';
  showCancelMfa();
  showMfaRequiredFactors();
}

function hideMfaRequired() {
  document.getElementById('mfa-required').style.display = 'none';
  hideMfaRequiredFactors();
  hideVerifyQuestion();
}

function showMfaRequiredFactors() {
  const containerElement = document.getElementById('mfa-required-factors');
  containerElement.style.display = 'block';
  const factors = appState.transaction.factors;
  factors.forEach(function(factor, index) {
    const el = document.createElement('div');
    el.setAttribute('id', `verify-factor-${index}`);
    el.setAttribute('class', `factor factor-${factor.factorType}`);
    const name = factorName(factor);
    el.innerHTML = `
      <span>${name}</span>
      <a href="#" onclick="_verifyMfaFactor(event, ${index})">Verify</a>
    `;
    containerElement.appendChild(el);
  });
}

function hideMfaRequiredFactors() {
  const containerElement = document.getElementById('mfa-required-factors');
  containerElement.style.display = 'none';
  containerElement.innerHTML = '';
}

function verifyMfaFactor(index) {
  hideMfaRequiredFactors();
  const factor = appState.transaction.factors[index];
  updateAppState({ factor });
  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return showVerifyQuestion();
  }

  // Default logic - this may not work for all factors
  hideMfa();
  factor.verify()
    .then(handleTransaction)
    .catch(showError);
}
window._verifyMfaFactor = bindClick(verifyMfaFactor);

function submitVerify() {
  const factor = appState.factor;

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return verifyQuestion();
  }

  throw new Error(`TODO: add support for verifying factorType: ${factor.factorType}`);
}

function showVerifyQuestion() {
  document.getElementById('mfa-verify-question').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Security Question';
  const questionText = appState.factor.profile.questionText;
  document.querySelector('#mfa-verify-question .question').innerText = questionText;
}

function hideVerifyQuestion() {
  document.getElementById('mfa-verify-question').style.display = 'none';
}

function verifyQuestion() {
  hideMfa();
  const answer = document.querySelector('#mfa-verify-question input[name=answer]').value;
  appState.factor.verify({
    answer
  })
    .then(handleTransaction)
    .catch(showError);
}
window._verifyQuestion = bindClick(verifyQuestion);
{{/if}}

// MFA_CHALLENGE https://github.com/okta/okta-auth-js/blob/master/docs/authn.md#mfa_challenge
function showMfaChallenge() {
  document.getElementById('mfa-challenge').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'MFA challenge';
  showPrevMfa();

  {{#if authn}}
  if (!config.useInteractionCodeFlow) {
    return showMfaChallengeAuthn();
  }
  {{/if}}

  const authenticator = appState.transaction.nextStep.authenticator;
  
  // Phone/SMS
  if (authenticator.type === 'phone') {
    return showChallengePhone();
  }
}

{{#if authn}}
function showMfaChallengeAuthn() {
  const factor = appState.transaction.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return showChallengeOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return showChallengePhone();
  }

  throw new Error(`TODO: handle MFA_CHALLENGE for factorType ${factor.factorType}`);
}
{{/if}}

function hideMfaChallenge() {
  document.getElementById('mfa-challenge').style.display = 'none';
  hideChallengeOktaVerify();
  hideChallengePhone();
}

{{#if authn}}
function submitChallenge() {
  const factor = appState.transaction.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return submitChallengeOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return submitChallengePhone();
  }

  throw new Error(`TODO: handle submit MFA_CHALLENGE for factorType ${factor.factorType}`);
}
{{/if}}

function showChallengeOktaVerify() {
  document.getElementById('mfa-challenge-okta-verify').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Okta Verify';
  showSubmitMfa();
}

function hideChallengeOktaVerify() {
  document.getElementById('mfa-challenge-okta-verify').style.display = 'none';
}

{{#if authn}}
function submitChallengeOktaVerify() {
  hideMfa();
  const passCode = document.querySelector('#mfa-challenge-okta-verify input[name=passcode]').value;
  appState.transaction.verify({ passCode })
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

// authenticator-enrollment-data (IDX)
function showAuthenticatorEnrollmentData() {
  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    showMfaEnroll();
    showEnrollPhone(); // enter phone number
    showAuthenticatorVerificationData(); // choose methodType
    return;
  }
  throw new Error(`TODO: handle authenticator-enrollmentt-data for authenticator type ${authenticator.type}`);
}

function submitAuthenticatorEnrollmentData() {
  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    return submitAuthenticatorEnrollmentDataPhone();
  }
  throw new Error(`TODO: handle submit authenticator-enrollment-data for authenticator type ${authenticator.type}`);
}

function submitAuthenticatorEnrollmentDataPhone() {
  hideMfa();
  const methodType = document.querySelector('#authenticator-verification-data-phone select[name=methodType]').value;
  const phoneNumber = document.querySelector('#mfa-enroll-phone input[name=phone]').value;
  authClient.idx.authenticate({ methodType, phoneNumber })
    .then(handleTransaction)
    .catch(showError);
}

// authenticator-verification-data (IDX)
function hideAuthenticatorVerificationData() {
  document.getElementById('authenticator-verification-data').style.display = 'none';
  hideAuthenticatorVerificationDataPhone();
}

function showAuthenticatorVerificationData() {
  document.getElementById('authenticator-verification-data').style.display = 'block';
  showCancelMfa();

  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    return showAuthenticatorVerificationDataPhone();
  }

  throw new Error(`TODO: handle authenticator-verification-data for authenticator type ${authenticator.type}`);
}

function submitAuthenticatorVerificationData() {
  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    return submitAuthenticatorVerificationDataPhone();
  }
  throw new Error(`TODO: handle submit authenticator-verification-data for authenticator type ${authenticator.type}`);
}

function hideAuthenticatorVerificationDataPhone() {
  document.getElementById('authenticator-verification-data-phone').style.display = 'none';
}

function showAuthenticatorVerificationDataPhone() {
  showSubmitMfa();
  document.getElementById('authenticator-verification-data-phone').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Phone/SMS';
  const selectElem = document.querySelector('#authenticator-verification-data-phone select[name=methodType]');
  const options = appState.transaction.nextStep.options;
  options.forEach(function(option) {
    const el = document.createElement('option');
    el.setAttribute('value', option.value);
    el.innerText = option.label;
    selectElem.appendChild(el);
  });
}

function submitAuthenticatorVerificationDataPhone() {
  hideMfa();
  const methodType = document.querySelector('#authenticator-verification-data-phone select[name=methodType]').value;
  authClient.idx.authenticate({ methodType })
    .then(handleTransaction)
    .catch(showError);
}

// challenge-authenticator
function submitChallengeAuthenticator() {
  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    return submitChallengePhone();
  }
  throw new Error(`TODO: handle submit challenge-authenticator for authenticator type ${authenticator.type}`);
}
