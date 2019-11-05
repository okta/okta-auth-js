import { htmlString } from './util';

function tokensHTML(tokens) {
  let accessToken;
  let idToken;
  if (!tokens) {
    return '';
  } else if (Array.isArray(tokens)) {
    if (tokens.length < 2) {
      return '';
    }
    accessToken = tokens.filter(token => {
      return token.accessToken;
    })[0];
    idToken = tokens.filter(token => {
      return token.idToken;
    })[0];
  } else {
    accessToken = tokens.accessToken;
    idToken = tokens.idToken;
  }

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
