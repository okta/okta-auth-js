function polyFill() {
  require('fast-text-encoding'); // polyfill TextEncoder
  var Crypto = require('@peculiar/webcrypto').Crypto; // provides crypto.subtle.digest
  window.crypto = new Crypto();
}

module.exports = {
  polyFill: polyFill
};
