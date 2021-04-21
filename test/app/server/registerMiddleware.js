const uniqueId = require('./util').uniqueId;
const getAuthClient = require('./authClient');
const toQueryString = require('../src/util').toQueryString;

module.exports = async function registerMiddleware(req, res) {
  console.log('registerMiddleware received form data:', req.body, req.query, req.url, req.originalUrl);
  const {
    firstName, lastName, email, password
  } = req.body;
  const transactionId = req.body.transactionId || uniqueId();

  const config = JSON.parse(req.body.config);
  const {
    issuer, clientId, redirectUri, scopes, responseType, clientSecret, useInteractionCodeFlow
  } = config;

  const authenticators = ['password'];

  let status = '';
  let idToken = {};
  let accessToken = {};
  let login = '';
  let error = '';
  
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

  try {
    // Start registration
    const { stateHandle } = await authClient.idx.register({
      firstName,
      lastName,
      email,
      authenticators,
    });

    // Continue registration
    ({ status, tokens: { tokens: { accessToken, idToken } } } = await authClient.idx.register({
      password, 
      authenticators,
      stateHandle 
    }));

    // Get userInfo with tokens
    const userinfo = await authClient.token.getUserInfo(accessToken, idToken);
    login = userinfo.email;

  } catch (err) {
    error = err;
    console.error('registerMiddleware caught error: ', error, JSON.stringify(error, null, 2));
  }

  const qs = toQueryString(Object.assign({}, config, {
    status,
    idToken: idToken.idToken || '',
    accessToken: accessToken.accessToken || '',
    login,
    error: JSON.stringify(error, null, 2)
  }));
  console.log('Reloading the page. STATUS=', status);
  res.redirect('/server' + qs);

};
