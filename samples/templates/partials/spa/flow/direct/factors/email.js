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
  // TODO: email can be used for authentication or recovery.
  // ExpressJS sample uses "idxMethod" in persistent storage to workaround not knowing which flow we are on
  // Here we are assuming email is being used for recovery. This likely breaks email as authenticator
  authClient.idx.recoverPassword({ verificationCode: passCode })
  .then(handleTransaction)
  .catch(showError);
}
