/* global document */
import { flattenConfig } from './config';

const Form = `
  <form target="/oidc" method="GET">
  <label for="issuer">Issuer</label><input id="issuer" name="issuer" type="text" /><br/>
  <label for="clientId">Client ID</label><input id="clientId" name="clientId" type="text" /><br/>
  <label for="pkce">PKCE</label><input id="pkce" name="pkce" type="checkbox"/><br/>
  <label for="responseMode">Response Mode</label>
  <select id="responseMode" name="responseMode">
    <option value="" selected>Auto</option>
    <option value="fragment">Fragment</option>
    <option value="query">Query</option>
  </select><br/>
  <label for="storage">Storage</label>
  <select id="storage" name="storage">
    <option value="" selected>Auto</option>
    <option value="localStorage">Local Storage</option>
    <option value="sessionStorage">Session Storage</option>
    <option value="cookie">Cookie</option>
    <option value="memory">Memory</option>
  </select><br/>
  <label for="secure">Secure Cookies</label><input id="secure" name="secure" type="checkbox"/><br/>
  <hr/>
  <input id="login-submit" type="submit" value="Update Config"/>
  </form>
`;

function updateForm(config) {
  config = flattenConfig(config);
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('clientId').value = config.clientId;
  document.getElementById('pkce').checked = !!config.pkce;
  document.querySelector(`#responseMode [value="${config.responseMode || ''}"]`).selected = true;
  document.querySelector(`#storage [value="${config.storage || ''}"]`).selected = true;
  document.getElementById('secure').checked = !!config.secure;
}

export { Form, updateForm };
