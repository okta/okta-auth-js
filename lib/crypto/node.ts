/* global atob, btoa */

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

let crypto;
try {
  crypto = require('crypto');
} catch (err) {
  // this environment has no crypto module!
}

let webcrypto;
if (typeof crypto !== 'undefined' && crypto['webcrypto']) {
  webcrypto = crypto['webcrypto'];
} else {
  const { Crypto } = require('@peculiar/webcrypto');
  webcrypto = new Crypto();
}

export { webcrypto };
