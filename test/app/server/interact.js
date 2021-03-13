const util = require('../src/util');
const getAuthClient = require('./authClient');

module.exports = function interactMiddleware(req, res) {
  const issuer = req.body.issuer;
  let status = '';
  let sessionToken = '';
  let error = '';
  
  const authClient = getAuthClient({ issuer });
  authClient.signIn({
    useInteractionCodeFlow: true
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
