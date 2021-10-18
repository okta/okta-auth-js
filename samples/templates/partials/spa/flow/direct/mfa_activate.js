// After an MFA factor has been selected for enrollment, there may be additional steps to activate the factor
{{#if authn}}
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
