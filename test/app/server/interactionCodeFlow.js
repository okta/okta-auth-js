const getAuthClient = require('./authClient');

// The request query should contain a code and state, or an error and error_description.
module.exports = function handleInteractionCode(req, res) {
  const error = req.query.error;
  if (error) {
    res.send(`
      <html>
        <body>
          <h1>${error}</h1>
          <p>
          ${req.query.error_description}
          </p>
        </body>
      </html>
    `);
    return;
  }

  const interactionCode = req.query.interaction_code;

  // state can be any string. In this sample are using it to store our config
  const state = JSON.parse(req.query.state);
  const { issuer, clientId, redirectUri } = state;

  const authClient = getAuthClient({ issuer, clientId, redirectUri });
  authClient.token.exchangeCodeForTokens({ interactionCode })
    .then((res) => {
      console.log('Result', res);
    });
};
