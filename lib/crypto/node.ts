/* global atob, btoa, crypto */

// Ponyfill for NodeJS
// Webpack config excludes this file

let a;
if (typeof atob !== 'undefined') {
  a = atob;
} else {
  a = require('atob');
}
export { a as atob };


let b;
if (typeof btoa !== 'undefined') {
  b = btoa;
} else {
  b = require('btoa');
}
export { b as btoa };

let webCrypto;
if (typeof crypto !== 'undefined' && crypto.subtle) {
  console.log('UING BUILT IN CRYPTO');
  webCrypto = crypto;
} else {
  console.log('PONYFILLING');
  const { Crypto } = require('@peculiar/webcrypto');
  webCrypto = new Crypto();
}

export { webCrypto as webcrypto };
