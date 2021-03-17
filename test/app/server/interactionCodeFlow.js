const getAuthClient = require('./authClient');

// The request query should contain a code and state, or an error and error_description.
module.exports = function handleInteractionCode(req) {
  const interactionCode = req.query.interaction_code;

  // state can be any string. In this sample are using it to store our config
  const state = JSON.parse(req.query.state);
  const { issuer, clientId, redirectUri } = state;

  const authClient = getAuthClient({ issuer, clientId, redirectUri });
  return authClient.token.exchangeCodeForTokens({ interactionCode })
    .then((res) => {
      console.log('Result', res);
    });
};
