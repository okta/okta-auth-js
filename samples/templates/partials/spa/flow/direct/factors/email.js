function showChallengeEmail() {
  document.getElementById('mfa-challenge-email').style.display = 'block';
  showSubmitMfa();
}

function hideChallengeEmail() {
  document.getElementById('mfa-challenge-email').style.display = 'none';
  document.querySelector('#mfa-challenge-email input[name=passcode]').value = '';
}

function submitChallengeEmail() {
  const passCode = document.querySelector('#mfa-challenge-email input[name=passcode]').value;
  hideMfa();

  // IDX
  // email can be used for authentication or recovery
  authClient.idx.proceed({ verificationCode: passCode })
  .then(handleTransaction)
  .catch(showError);
}
