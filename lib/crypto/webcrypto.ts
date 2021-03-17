/* global crypto */

// Ponyfill webcrypto for NodeJS
// Webpack config excludes this file

let webCrypto;
if (typeof crypto !== 'undefined' && crypto.subtle) {
  console.log('UING BUILT IN CRYPTO')
  webCrypto = crypto;
} else {
  console.log('PONYFILLING');
  const { Crypto } = require('@peculiar/webcrypto');
  webCrypto = new Crypto();
}

export default webCrypto;


