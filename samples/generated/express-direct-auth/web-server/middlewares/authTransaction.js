const crypto = require('crypto');

function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = function authTransaction(req, res, next) {
  let transactionId;
  if (req.query.transactionId) {
    transactionId = req.query.transactionId;
  } else if (req.query.state) {
    transactionId = req.query.state;
  } else {
    transactionId = uniqueId();
  }
  req.transactionId = transactionId;

  next();
};
