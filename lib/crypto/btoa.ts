/* global btoa */

// Ponyfill webcrypto for NodeJS
// Webpack config excludes this file

let b;
if (typeof btoa !== 'undefined') {
  b = btoa;
} else {
  b = require('btoa');
}
export default b;