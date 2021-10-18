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
