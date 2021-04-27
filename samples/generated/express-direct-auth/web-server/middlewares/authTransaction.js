const crypto = require('crypto');

function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = function authTransaction(req, res, next) {
  const { 
    transactionId: transactionIdFromQuery, 
    state: stateFromQuery, 
  } = req.query;
  const { 
    transactionId: transactionIdFromSession,
    state: stateFromSession,
  } = req.session;
  
  req.transactionId = transactionIdFromQuery 
    || stateFromQuery 
    || transactionIdFromSession 
    || stateFromSession
    || uniqueId();

  next();
};
