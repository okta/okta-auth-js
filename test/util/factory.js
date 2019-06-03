var sdkUtil = require('../../lib/util');
var factory = {};

factory.buildIDToken = function(options) {
  var header = {};
  var signature = {};
  var payload = {}

  options = options || {};
  payload.iss = options.issuer;
  payload.aud = options.clientId;
  payload.iat = Date.now() / 1000;
  payload.exp = payload.iat + (1000 * 30);

  return [
    sdkUtil.stringToBase64Url(JSON.stringify(header)),
    sdkUtil.stringToBase64Url(JSON.stringify(payload)),
    sdkUtil.stringToBase64Url(JSON.stringify(signature))
  ].join('.');
}

module.exports = factory;