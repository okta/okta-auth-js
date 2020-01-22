import { htmlString } from './util';

function tokensHTML(tokens) {
  const { idToken, accessToken } = tokens;
  const claims = idToken.claims;
  const html = `
  <table id="claims">
    <thead>
      <tr>
        <th>Claim</th><th>Value</th>
      </tr>
    </thead>
    <tbody>
    ${
      Object.keys(claims).map((key) => {
        return `<tr><td>${key}</td><td>${claims[key]}</td></tr>`;
      }).join('\n')
    }
    </tbody>
  </table>
  <hr/>
  <div class="flex-row">
    <div class="box">
      <strong>Access Token</strong><br/>
      <div id="access-token">${ htmlString(accessToken) }</div>
    </div>
    <div class="box">
      <strong>ID Token</strong><br/>
      <div id="id-token">${ htmlString(idToken) }</div>
    </div>
  </div>
  `;
  return html;
}

export { tokensHTML };
