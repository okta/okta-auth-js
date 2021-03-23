const getAuthClient = require('./authClient');

// The request query should contain an interaction_code and state OR an error and error_description.
module.exports = function handleInteractionCode(req) {
  const interactionCode = req.query.interaction_code;

  // state can be any string. In this sample are using it to store our config
  const state = JSON.parse(req.query.state);
  const { issuer, clientId, redirectUri, transactionId, clientSecret } = state;

  const authClient = getAuthClient({
    // Each transaction needs unique storage, there may be several clients
    storageManager: {
      transaction: {
        storageKey: 'transaction-' + transactionId
      }
    },
    issuer,
    clientId,
    redirectUri,
    clientSecret
  });

  const meta = authClient.transactionManager.load();
  const { codeVerifier } = meta;
  return authClient.token.exchangeCodeForTokens({ interactionCode, codeVerifier });
};
