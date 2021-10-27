"use strict";

exports.validateToken = validateToken;

var _errors = require("../../errors");

var _types = require("../../types");

/* eslint-disable complexity */
function validateToken(token, type) {
  if (!(0, _types.isIDToken)(token) && !(0, _types.isAccessToken)(token) && !(0, _types.isRefreshToken)(token)) {
    throw new _errors.AuthSdkError('Token must be an Object with scopes, expiresAt, and one of: an idToken, accessToken, or refreshToken property');
  }

  if (type === 'accessToken' && !(0, _types.isAccessToken)(token)) {
    throw new _errors.AuthSdkError('invalid accessToken');
  }

  if (type === 'idToken' && !(0, _types.isIDToken)(token)) {
    throw new _errors.AuthSdkError('invalid idToken');
  }

  if (type === 'refreshToken' && !(0, _types.isRefreshToken)(token)) {
    throw new _errors.AuthSdkError('invalid refreshToken');
  }
}
//# sourceMappingURL=validateToken.js.map