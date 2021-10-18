// Factor: Security Question

{{#if authn}}
function selectQuestionForEnrollmentAuthn() {
  const factor = appState.factor;
  return factor.questions().then(function(questions) {
    updateAppState({ questions });
    showEnrollQuestion();
  });
}
{{/if}}

function hideEnrollQuestion() {
  document.getElementById('mfa-enroll-question').style.display = 'none';
  document.querySelector('#mfa-enroll-question select[name=questions]').innerHTML = '';
}

function showEnrollQuestion() {
  showMfaEnroll();
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
  const question = document.querySelector('#mfa-enroll-question select[name=questions]').value;
  const answer = document.querySelector('#mfa-enroll-question input[name=answer]').value;
  const factor = appState.factor;
  hideMfa();
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

function getVerifyQuestionText() {
  {{#if authn}}
    // Authn
    if (!config.useInteractionCodeFlow) {
      return appState.factor.profile.questionText;
    }
  {{/if}}
  // IDX
  return appState.transaction.nextStep.authenticator.profile.question;
}

function showChallengeQuestion() {
  showSubmitMfa();
  document.getElementById('mfa-challenge-question').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'Security Question';
  const questionText = getVerifyQuestionText();
  document.querySelector('#mfa-challenge-question .question').innerText = questionText;
}

function hideChallengeQuestion() {
  document.getElementById('mfa-challenge-question').style.display = 'none';
}

{{#if authn}}
function submitChallengeQuestion() {
  hideMfa();
  const answer = document.querySelector('#mfa-challenge-question input[name=answer]').value;

  {{#if authn}}
  // Authn
  if (!config.useInteractionCodeFlow) {
    return appState.factor.verify({
      answer
    })
      .then(handleTransaction)
      .catch(showError);
  }
  {{/if}}

  // IDX
  const questionKey = appState.transaction.nextStep.authenticator.profile.questionKey;
  authClient.idx.authenticate({ credentials: { questionKey, answer } })
    .then(handleTransaction)
    .catch(showError);
}
{{/if}}