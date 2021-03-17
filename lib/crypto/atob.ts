/* global atob */

// Ponyfill webcrypto for NodeJS
// Webpack config excludes this file

let a;
if (typeof atob !== 'undefined') {
  a = atob;
} else {
  a = require('atob');
}
export default a;
