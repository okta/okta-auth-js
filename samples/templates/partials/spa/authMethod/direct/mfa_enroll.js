// Show a list of MFA factors. The user can pick a factor to enroll in.
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
      <a href="#" onclick="_selectMfaFactorForEnrollment(event, ${index})">Enroll</a>
    `;
    containerElement.appendChild(el);
  });
}

function hideMfaEnrollFactors() {
  const containerElement = document.getElementById('mfa-enroll-factors');
  containerElement.style.display = 'none';
  containerElement.innerHTML = '';
}

function selectMfaFactorForEnrollment(index) {
  hideMfaEnroll();
  {{#if authn}}
  // Authn
  if (!config.useInteractionCodeFlow) {
    return selectMfaFactorForEnrollmentAuthn(index);
  }
  {{/if}}

  // IDX
  const authenticator = appState.transaction.nextStep.options[index].value;
  authClient.idx.authenticate({ authenticator })
    .then(handleTransaction)
    .catch(showError);
}
window._selectMfaFactorForEnrollment = bindClick(selectMfaFactorForEnrollment);

{{#if authn}}
function selectMfaFactorForEnrollmentAuthn(index) {
  const factor = appState.transaction.factors[index];
  updateAppState({ factor });

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return selectQuestionForEnrollmentAuthn();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return showEnrollPhone();
  }

  // Default logic - this may not work for all factor types
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

// authenticator-enrollment-data (IDX)
function showAuthenticatorEnrollmentData() {
  const authenticator = appState.transaction.nextStep.authenticator;
  if (authenticator.type === 'phone') {
    showMfaEnroll();
    showEnrollPhone(); // enter phone number
    showAuthenticatorVerificationData(); // select methodType
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
