"use strict";

exports.isSameRefreshToken = isSameRefreshToken;
exports.isRefreshTokenError = isRefreshTokenError;

var _errors = require("../../errors");

function isSameRefreshToken(a, b) {
  return a.refreshToken === b.refreshToken;
}

function isRefreshTokenError(err) {
  if (!(0, _errors.isAuthApiError)(err)) {
    return false;
  }

  if (!err.xhr || !err.xhr.responseJSON) {
    return false;
  }

  const {
    responseJSON
  } = err.xhr;

  if (responseJSON.error === 'invalid_grant') {
    return true;
  }

  return false;
}
//# sourceMappingURL=refreshToken.js.map