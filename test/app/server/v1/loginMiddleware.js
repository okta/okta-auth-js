const util = require('../../src/util');
const getAuthClient = require('../authClient');

module.exports = function loginMiddleware(req, res) {
  const issuer = req.body.issuer;
  const username = req.body.username;
  const password = req.body.password;
  let status = '';
  let sessionToken = '';
  let error = '';
  
  const authClient = getAuthClient({ issuer });
  authClient.signIn({
    username,
    password
  })
  .then(function(transaction) {
    status = transaction.status;
    sessionToken = transaction.sessionToken;
  })
  .catch(function(err) {
    error = err;
    console.error(error);
  })
  .finally(function() {
    const qs = util.toQueryString({
      status,
      sessionToken,
      error
    });
    res.redirect('/server' + qs);
  });
};
