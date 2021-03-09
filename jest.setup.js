// crypto to mimic browser environment
const Crypto = require('@peculiar/webcrypto').Crypto;
global.crypto = new Crypto();

// TextEncoder
const TextEncoder = require('util').TextEncoder;
// eslint-disable-next-line node/no-unsupported-features/node-builtins
global.TextEncoder = TextEncoder;

// Suppress warning messages
global.console.warn = function() {};

// Throw an error if any test tries to make a live network request
global.fetch = function(url) {
  throw new Error(`Attempt to make a live network request: ${url}`);
};
