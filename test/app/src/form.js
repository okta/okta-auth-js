/* global document */
const Form = `
  <form target="/oidc" method="GET">
  <label for="issuer">Issuer</label><input id="issuer" name="issuer" /><br/>
  <label for="clientId">Client ID</label><input id="clientId" name="clientId" /><br/>
  <label for="pkce">PKCE</label><input id="pkce" name="pkce" type="checkbox"/><br/>
  <input id="login-submit" type="submit" value="Update Config"/>
  </form>
`;

function updateForm(config) {
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('clientId').value = config.clientId;
  document.getElementById('pkce').checked = !!config.pkce;
}

export { Form, updateForm };
