const crypto = require('crypto');

module.exports = function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
};
