const getAuthClient = require('./authClient');
const uniqueId = require('./util').uniqueId;

module.exports = function widgetMiddleware(req, res) {

  const query = req.query;

  const transactionId = req.query.transactionId || uniqueId();
  const issuer = query.issuer;
  const clientId = query.clientId;
  const redirectUri = query.redirectUri;
  const scopes = query.scopes !== undefined ? query.scopes.split(',') : [];
  const responseType = query.responseType;
  const useInteractionCodeFlow = query.useInteractionCodeFlow;
  const clientSecret = query.clientSecret;

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
    scopes,
    responseType,
    useInteractionCodeFlow
  });

  console.log('OPTIONS', authClient.options);
  const state = JSON.stringify({ issuer, clientId, redirectUri, transactionId, clientSecret }).replace(/"/g, '\\"');
  authClient.idx.interact({ state })
    .then(idxRes => {
      const interactionHandle = idxRes.interactionHandle;
      const codeChallenge = idxRes.meta.codeChallenge;
      const codeChallengeMethod = idxRes.meta.codeChallengeMethod;
      const html = `
        <html>
          <head>
            <link rel="stylesheet" href="/oidc-app.css"/>
            <script src="/oidc-app.js"></script>
          </head>
          <body class="web-app login">
            <script type="text/javascript">
              renderWidget(null, {
                redirect: "always",
                state: "${state}",
                scopes: ${JSON.stringify(scopes)},
                interactionHandle: "${interactionHandle}",
                codeChallenge: "${codeChallenge}",
                codeChallengeMethod: "${codeChallengeMethod}",
                useInteractionCodeFlow: true
              });
            </script>
          </body>
      `;
      res.send(html);
    })
    .catch(err => {
      console.error(err);
      const html = `
        <html>
          <body class="web-app login error">
            ${JSON.stringify(err, null, 2)}
          </body>
      `;
      res.send(html);
    });
};
