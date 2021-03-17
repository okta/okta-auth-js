const util = require('../src/util');
const getAuthClient = require('./authClient');

module.exports = function loginMiddleware(req, res) {
  console.log('loginMiddleware received form data:', req.body, req.query, req.url, req.originalUrl);
  const username = req.body.username;
  const password = req.body.password;

  const config = JSON.parse(req.body.config);
  const issuer = config.issuer;
  const clientId = config.clientId;
  const redirectUri = config.redirectUri;
  const useInteractionCodeFlow = config.useInteractionCodeFlow;

  let status = '';
  let sessionToken = '';
  let error = '';
  
  const authClient = getAuthClient({
    issuer,
    clientId,
    redirectUri,
    useInteractionCodeFlow
  });

  authClient.signIn({ username, password })
  .then(function(transaction) {
    console.log('TRANSACTION', JSON.stringify(transaction.data, null, 2));
    status = transaction.status;
    sessionToken = transaction.sessionToken;
  })
  .catch(function(err) {
    error = err;
    console.error('loginMiddleware caught error: ', error, JSON.stringify(error, null, 2));
  })
  .finally(function() {
    const qs = util.toQueryString(Object.assign({}, config, {
      status,
      sessionToken,
      error: JSON.stringify(error, null, 2)
    }));
    res.redirect('/server' + qs);
  });
};
