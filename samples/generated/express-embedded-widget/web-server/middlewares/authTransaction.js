const crypto = require('crypto');

function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = function authTransaction(req, res, next) {
  const { transactionId, state } = req.query;
  req.transactionId = transactionId || state || uniqueId();

  next();
};
