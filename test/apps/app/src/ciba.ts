import { htmlString } from './util';

export function cibaHTML(): string {
  const html = `
    <div class="actions ciba pure-menu pure-menu-horizontal">
      <ul class="pure-menu-list">
        <li class="pure-menu-item">
          <a data-action="start-authentication-request" onclick="backChannelAuthenticationRequest(event)" class="pure-menu-link">Start Authentication Request</a>
        </li>
        <li class="pure-menu-item">
          <a data-action="poll-tokens" onclick="logoutXHR(event)" class="pure-menu-link">Poll tokens (not functional)</a>
        </li>
      </ul>
    </div>
    <div class="response">
    </div>
  `;
  return html;
}

export async function backChannelAuthenticationRequest() {
  const resp = await this.oktaAuth.options.httpRequestClient(
    'POST',
    `${this.oktaAuth.options.issuer}/v1/bc/authorize`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        scope: this.oktaAuth.options.scopes.concat(' '),
        client_id: this.oktaAuth.options.clientId,
        id_token_hint: this.oktaAuth.tokenManager.getTokensSync().idToken.idToken,
      }
    }
  );
  // request not working, seems has issue with `Access-Control-Allow-Origin` header from server side
  // JIRA for customerFed team: https://oktainc.atlassian.net/browse/OKTA-535163
  console.log('ciba resp', resp);
  const responseElem = document.querySelector('#ciba .response');
  responseElem.innerHTML = htmlString(resp);
}
