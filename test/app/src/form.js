import { flattenConfig } from './config';

const Form = `
  <form target="/oidc" method="GET">
  <label for="issuer">Issuer</label><input id="issuer" name="issuer" type="text" /><br/>
  <label for="clientId">Client ID</label><input id="clientId" name="clientId" type="text" /><br/>
  <label for="responseType">Response Type (comma separated)</label>
    <input id="responseType" name="responseType" type="text" /><br/>
  <label for="redirectUri">Redirect URI</label><input id="redirectUri" name="redirectUri" type="text" /><br/>
  <label for="postLogoutRedirectUri">Post Logout Redirect URI</label>
    <input id="postLogoutRedirectUri" name="postLogoutRedirectUri" type="text" /><br/>
  <label for="responseMode">Response Mode</label>
  <select id="responseMode" name="responseMode">
    <option value="" selected>Auto</option>
    <option value="fragment">Fragment</option>
    <option value="query">Query</option>
  </select><br/>
  <label for="pkce">PKCE</label><br/>
  <input id="pkce-on" name="pkce" type="radio" value="true"/>ON<br/>
  <input id="pkce-off" name="pkce" type="radio" value="false"/>OFF<br/>
  <label for="storage">Storage</label>
  <select id="storage" name="storage">
    <option value="" selected>Auto</option>
    <option value="localStorage">Local Storage</option>
    <option value="sessionStorage">Session Storage</option>
    <option value="cookie">Cookie</option>
    <option value="memory">Memory</option>
  </select><br/>
  <label for="secure">Secure Cookies</label><br/>
  <input id="secureCookies-on" name="secure" type="radio" value="true"/>ON<br/>
  <input id="secureCookies-off" name="secure" type="radio" value="false"/>OFF<br/>
  <select id="sameSite" name="sameSite">
    <option value="" selected>Auto</option>
    <option value="none">None</option>
    <option value="lax">Lax</option>
    <option value="strict">Strict</option>
  </select><br/>
  <hr/>
  <input id="login-submit" type="submit" value="Update Config"/>
  </form>
`;

function updateForm(config) {
  config = flattenConfig(config);
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('redirectUri').value = config.redirectUri;
  document.getElementById('responseType').value = config.responseType.join(',');
  document.getElementById('postLogoutRedirectUri').value = config.postLogoutRedirectUri;
  document.getElementById('clientId').value = config.clientId;
  document.querySelector(`#responseMode [value="${config.responseMode || ''}"]`).selected = true;
  document.querySelector(`#storage [value="${config.storage || ''}"]`).selected = true;
  document.querySelector(`#sameSite [value="${config.sameSite || ''}"]`).selected = true;

  if (config.pkce) {
    document.getElementById('pkce-on').checked = true;
  } else {
    document.getElementById('pkce-off').checked = true;
  }

  if (config.secure) {
    document.getElementById('secureCookies-on').checked = true;
  } else {
    document.getElementById('secureCookies-off').checked = true;
  }
}

export { Form, updateForm };
