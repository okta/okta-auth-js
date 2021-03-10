// Running in a "node" environment so there should be no window
if (typeof window !== 'undefined') {
  throw new Error('server tests should be run in a node environment');
}

// Polyfill a few things

// needed by base64.ts
global.btoa = require('btoa');
global.atob = require('atob');

// Promise.allSettled is added in Node 12.10
// Needed by tests
const allSettled = require('promise.allsettled');
allSettled.shim(); // will be a no-op if not needed