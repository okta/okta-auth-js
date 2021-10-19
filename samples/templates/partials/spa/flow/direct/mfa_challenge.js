// Prompts the user to enter a value to satisfy an MFA factor challenge
function showMfaChallenge() {
  document.getElementById('mfa-challenge').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'MFA challenge';
  showPrevMfa();

  {{#if authn}}
  // Authn
  if (!config.useInteractionCodeFlow) {
    return showMfaChallengeAuthn();
  }
  {{/if}}

  const authenticator = appState.transaction.nextStep.authenticator;
  
  // Phone/SMS
  if (authenticator.type === 'phone') {
    return showChallengePhone();
  }

  // Security Question
  if (authenticator.type === 'security_question') {
    return showChallengeQuestion();
  }

  // Email
  if (authenticator.type === 'email') {
    return showChallengeEmail();
  }
}

{{#if authn}}
function showMfaChallengeAuthn() {
  const factor = appState.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return showChallengeOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return showChallengePhone();
  }

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return showChallengeQuestion();
  }

  throw new Error(`TODO: handle MFA_CHALLENGE for factorType ${factor.factorType}`);
}
{{/if}}

function hideMfaChallenge() {
  document.getElementById('mfa-challenge').style.display = 'none';
  hideChallengeOktaVerify();
  hideChallengePhone();
  hideChallengeQuestion();
  hideChallengeEmail();
}

{{#if authn}}
function submitChallenge() {
  const factor = appState.factor;

  // Okta Verify
  if (factor.provider === 'OKTA' && factor.factorType === 'token:software:totp') {
    return submitChallengeOktaVerify();
  }

  // Phone/SMS
  if (factor.provider === 'OKTA' && (factor.factorType === 'sms' || factor.factorType === 'call')) {
    return submitChallengePhone();
  }

  // Security Question
  if (factor.provider === 'OKTA' && factor.factorType === 'question') {
    return submitChallengeQuestion();
  }

  throw new Error(`TODO: handle submit MFA_CHALLENGE for factorType ${factor.factorType}`);
}
{{/if}}


// challenge-authenticator (IDX)
function submitChallengeAuthenticator() {
  const authenticator = appState.transaction.nextStep.authenticator;
  
  // Phone/SMS
  if (authenticator.type === 'phone') {
    return submitChallengePhone();
  }

  // Security Question
  if (authenticator.type === 'security_question') {
    return submitChallengeQuestion();
  }

  // Email
  if (authenticator.type === 'email') {
    return submitChallengeEmail();
  }

  throw new Error(`TODO: handle submit challenge-authenticator for authenticator type ${authenticator.type}`);
}
