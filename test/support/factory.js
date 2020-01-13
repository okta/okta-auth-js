/* global btoa */
var factory = {};

// converts a standard base64-encoded string to a "url/filename safe" variant
var base64ToBase64Url = function(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// converts a string to base64 (url/filename safe variant)
var stringToBase64Url = function(str) {
  var b64 = btoa(str);
  return base64ToBase64Url(b64);
};

factory.buildIDToken = function(options) {
  var header = {};
  var signature = {};
  var payload = {};

  options = options || {};
  payload.iss = options.issuer;
  payload.aud = options.clientId;
  payload.iat = Date.now() / 1000;
  payload.exp = payload.iat + (1000 * 30);

  return [
    stringToBase64Url(JSON.stringify(header)),
    stringToBase64Url(JSON.stringify(payload)),
    stringToBase64Url(JSON.stringify(signature))
  ].join('.');
};

module.exports = factory;