/* eslint-disable max-len */
import { flattenConfig, Config } from './config';

const Form = `
  <form target="/oidc" method="GET">
  <label for="issuer">Issuer</label><input id="issuer" name="issuer" type="text" /><br/>
  <label for="clientId">Client ID</label><input id="clientId" name="clientId" type="text" /><br/>
  <label for="responseType">Response Type (comma separated)</label><input id="responseType" name="responseType" type="text" /><br/>
  <label for="_defaultScopes">Use DEFAULT scopes (defined by authorization server)</label><br/>
  <input id="default-scopes-yes" name="_defaultScopes" type="radio" value="true"/>YES<br/>
  <input id="default-scopes-no" name="_defaultScopes" type="radio" value="false"/>NO (list scopes below)<br/>
  <label for="scopes">Scopes (comma separated)</label><input id="scopes" name="scopes" type="text" /><br/>
  <label for="redirectUri">Redirect URI</label><input id="redirectUri" name="redirectUri" type="text" /><br/>
  <label for="postLogoutRedirectUri">Post Logout Redirect URI</label><input id="postLogoutRedirectUri" name="postLogoutRedirectUri" type="text" /><br/>
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

function updateForm(origConfig: Config): void {
  const config = flattenConfig(origConfig);
  (document.getElementById('issuer') as HTMLInputElement).value = config.issuer;
  (document.getElementById('redirectUri') as HTMLInputElement).value = config.redirectUri;
  (document.getElementById('responseType') as HTMLInputElement).value = config.responseType.join(',');
  (document.getElementById('scopes') as HTMLInputElement).value = config.scopes.join(',');
  (document.getElementById('postLogoutRedirectUri') as HTMLInputElement).value = config.postLogoutRedirectUri;
  (document.getElementById('clientId') as HTMLInputElement).value = config.clientId;
  (document.querySelector(`#responseMode [value="${config.responseMode || ''}"]`) as HTMLOptionElement).selected = true;
  (document.querySelector(`#storage [value="${config.storage || ''}"]`) as HTMLOptionElement).selected = true;
  (document.querySelector(`#sameSite [value="${config.sameSite || ''}"]`) as HTMLOptionElement).selected = true;

  if (config.pkce) {
    (document.getElementById('pkce-on') as HTMLInputElement).checked = true;
  } else {
    (document.getElementById('pkce-off') as HTMLInputElement).checked = true;
  }

  if (config.secure) {
    (document.getElementById('secureCookies-on') as HTMLInputElement).checked = true;
  } else {
    (document.getElementById('secureCookies-off') as HTMLInputElement).checked = true;
  }

  if (config._defaultScopes) {
    (document.getElementById('default-scopes-yes') as HTMLInputElement).checked = true;
    (document.getElementById('scopes') as HTMLInputElement).disabled = true;
  } else {
    (document.getElementById('default-scopes-no') as HTMLInputElement).checked = true;
    (document.getElementById('scopes') as HTMLInputElement).disabled = false;
  }
}

export { Form, updateForm };
