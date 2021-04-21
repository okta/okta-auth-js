const uniqueId = require('./util').uniqueId;
const getAuthClient = require('./authClient');
const toQueryString = require('../src/util').toQueryString;

module.exports = function loginMiddleware(req, res) {
  console.log('loginMiddleware received form data:', req.body, req.query, req.url, req.originalUrl);
  const username = req.body.username;
  const password = req.body.password;
  const transactionId = req.body.transactionId || uniqueId();

  const config = JSON.parse(req.body.config);
  const issuer = config.issuer;
  const clientId = config.clientId;
  const redirectUri = config.redirectUri;
  const scopes = config.scopes;
  const responseType = config.responseType;
  const clientSecret = config.clientSecret;
  const useInteractionCodeFlow = config.useInteractionCodeFlow;

  let status = '';
  let sessionToken = '';
  let error = '';
  let login = '';
  
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
    clientSecret,
    useInteractionCodeFlow
  });

  authClient.signIn({ username, password })
  .then(function(transaction) {
    console.log('TRANSACTION', JSON.stringify(transaction.data, null, 2));
    status = transaction.status;
    sessionToken = transaction.sessionToken;
    login = transaction.user.profile.login;
  })
  .catch(function(err) {
    error = err;
    console.error('loginMiddleware caught error: ', error, JSON.stringify(error, null, 2));
  })
  .finally(function() {
    const qs = toQueryString(Object.assign({}, config, {
      status,
      sessionToken,
      login,
      error: JSON.stringify(error, null, 2)
    }));
    console.log('Reloading the page. STATUS=', status);
    res.redirect('/server' + qs);
  });
};
