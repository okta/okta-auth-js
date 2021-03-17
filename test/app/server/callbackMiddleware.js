const handleAuthorizationCode = require('./authorizationCodeFlow');
const handleInteractionCode = require('./interactionCodeFlow');

function getTokens(req) {
  const interactionCode = req.query.interaction_code;
  if (interactionCode) {
    return handleInteractionCode(req);
  }

  const authorizationCode = req.query.code;
  if (authorizationCode) {
    return handleAuthorizationCode(req);
  }

  // We don't understand the URL, or there are no query parameters
  return Promise.resolve({});
}

function responseHtml(req, result, error, errorDescription) {
  let bodyHtml;
  if (error) {
    bodyHtml = `
      <h1>${error}</h1>
      <p>
      ${errorDescription}
      </p>
    `;
  } else {
    bodyHtml = `
      <code id="oidcResult">${result}</code>
    `;
  }

  return `
    <html>
      <body>
        ${bodyHtml}
      </body>
    </html>
  `;
}

module.exports = function callbackMiddleware(req, res) {
  // OAuth errors may be returned as a query parameter
  const error = req.query.error;
  if (error) {
    res.send(responseHtml(req, null, error, req.query.error_description));
    return;
  }

  let result = '';
  getTokens(req)
  .then(tokens => {
    result = JSON.stringify(tokens, null, 2);
  })
  .catch(err => {
    result = 'Error: ' + err.toString();
  })
  .finally(() => {
    res.send(responseHtml(req, result));
  });
};
