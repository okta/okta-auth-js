const getAuthClient = require('./authClient');

// The request query should contain a code and state, or an error and error_description.
module.exports = function handleInteractionCode(req) {
  const interactionCode = req.query.interaction_code;

  // state can be any string. In this sample are using it to store our config
  const state = JSON.parse(req.query.state);
  const { issuer, clientId, redirectUri, transactionId, clientSecret } = state;

  console.log('TRANSCATION ID', transactionId);
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
  console.log('READ META FROM STORAG: ', meta);
  const { codeVerifier } = meta;
  return authClient.token.exchangeCodeForTokens({ interactionCode, codeVerifier })
    .then((res) => {
      console.log('Result', res);
    })
    .catch(err => {
      console.error('Caught error: ', err);
    });
};
