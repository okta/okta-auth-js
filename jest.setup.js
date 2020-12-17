// crypto to mimic browser environment
const Crypto = require('@peculiar/webcrypto').Crypto;
global.crypto = new Crypto();

// TextEncoder
const TextEncoder = require('util').TextEncoder;
// eslint-disable-next-line node/no-unsupported-features/node-builtins
global.TextEncoder = TextEncoder;
