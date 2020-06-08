// Polyfills objects needed to support IE 11+
require('core-js/features/object/assign');
require('core-js/es/promise');
require('core-js/es/typed-array/uint8-array');
require('core-js/features/array/from');
require('core-js/web/url');
require('webcrypto-shim');

if (typeof window.TextEncoder !== 'function') {
  var TextEncodingPolyfill = require('text-encoding');
  window.TextEncoder = TextEncodingPolyfill.TextEncoder;
  window.TextDecoder = TextEncodingPolyfill.TextDecoder;
}
