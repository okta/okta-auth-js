// Show a list of enrolled MFA factors. The user can select which factor they want to use for verification.
function showMfaRequired() {
  document.getElementById('mfa-required').style.display = 'block';
  document.querySelector('#mfa .header').innerText = 'MFA is required';
  showCancelMfa();
  showMfaRequiredFactors();
}

function hideMfaRequired() {
  document.getElementById('mfa-required').style.display = 'none';
  hideMfaRequiredFactors();
}

function showMfaRequiredFactors() {
  const containerElement = document.getElementById('mfa-required-factors');
  containerElement.style.display = 'block';
  const names = listMfaFactors();
  names.forEach(function(name, index) {
    const el = document.createElement('div');
    el.setAttribute('id', `verify-factor-${index}`);
    el.setAttribute('class', `factor`);
    el.innerHTML = `
      <span>${name}</span>
      <a href="#" onclick="_selectMfaFactorForVerification(event, ${index})">Verify</a>
    `;
    containerElement.appendChild(el);
  });
}

function hideMfaRequiredFactors() {
  const containerElement = document.getElementById('mfa-required-factors');
  containerElement.style.display = 'none';
  containerElement.innerHTML = '';
}

function selectMfaFactorForVerification(index) {
  hideMfaRequired();
  {{#if authn}}
  // Authn
  if (!config.useInteractionCodeFlow) {
    return selectMfaFactorForVerificationAuthn(index);
  }
  {{/if}}

  // IDX
  // TODO: we may be in either authentication or recovery flow
  // ExpressJS sample uses "idxMethod" in persistent storage to workaround not knowing which flow we are on
  // Here we are assuming we are doing authentication, but this may cause issues with recovery
  const authenticator = appState.transaction.nextStep.options[index].value;
  authClient.idx.authenticate({ authenticator })
    .then(handleTransaction)
    .catch(showError);
}
window._selectMfaFactorForVerification = bindClick(selectMfaFactorForVerification);

{{#if authn}}
function selectMfaFactorForVerificationAuthn(index) {
  const factor = appState.transaction.factors[index];
  updateAppState({ factor });
  showMfaChallenge(); // transition to MFA_CHALLENGE state
}
{{/if}}

function submitMfaRequired() {
  // Presumably, user has selected an MFA factor and the appropriate challenge view is showing.
  return submitChallenge();
}
