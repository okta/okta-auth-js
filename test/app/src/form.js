/* global document */
import { flattenConfig } from './config';

const Form = `
  <form target="/oidc" method="GET">
  <label for="issuer">Issuer</label><input id="issuer" name="issuer" type="text" /><br/>
  <label for="clientId">Client ID</label><input id="clientId" name="clientId" type="text" /><br/>
  <label for="redirectUri">Redirect URI</label><input id="redirectUri" name="redirectUri" type="text" /><br/>
  <label for="postLogoutRedirectUri">Post Logout Redirect URI</label><input id="postLogoutRedirectUri" name="postLogoutRedirectUri" type="text" /><br/>
  <label for="pkce">PKCE</label><input id="pkce" name="pkce" type="checkbox"/><br/>
  <label for="storage">Storage</label>
  <select id="storage" name="storage">
    <option value="" selected>Auto</option>
    <option value="localStorage">Local Storage</option>
    <option value="sessionStorage">Session Storage</option>
    <option value="cookie">Cookie</option>
    <option value="memory">Memory</option>
  </select><br/>
  <label for="secure">Secure Cookies</label><input id="secureCookies" name="secureCookies" type="checkbox"/><br/>
  <hr/>
  <input id="login-submit" type="submit" value="Update Config"/>
  </form>
`;

function updateForm(config) {
  config = flattenConfig(config);
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('redirectUri').value = config.redirectUri;
  document.getElementById('postLogoutRedirectUri').value = config.postLogoutRedirectUri;
  document.getElementById('clientId').value = config.clientId;
  document.getElementById('pkce').checked = !!config.pkce;
  document.querySelector(`#storage [value="${config.storage || ''}"]`).selected = true;
  document.getElementById('secureCookies').checked = !!config.secureCookies;
}

export { Form, updateForm };
