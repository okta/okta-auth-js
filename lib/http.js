/* globals SDK_VERSION, STATE_TOKEN_COOKIE_NAME */
/* eslint-disable complexity */
var util = require('./util');
var cookies = require('./cookies');
var Q = require('q');
var AuthApiError = require('./errors/AuthApiError');

function httpRequest(sdk, url, method, args, dontSaveResponse) {
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Okta-SDK': 'okta-auth-js-' + SDK_VERSION
  };
  util.extend(headers, sdk.options.headers || {});

  var options = {
    headers: headers,
    data: args || undefined
  };

  var err, res;
  return new Q(sdk.options.ajaxRequest(method, url, options))
    .then(function(resp) {
      res = resp.responseText;
      if (res && util.isString(res)) {
        res = JSON.parse(res);
      }

      if (!dontSaveResponse) {
        if (!res.stateToken) {
          cookies.deleteCookie(STATE_TOKEN_COOKIE_NAME);
        }
      }

      if (res && res.stateToken && res.expiresAt) {
        cookies.setCookie(STATE_TOKEN_COOKIE_NAME, res.stateToken, res.expiresAt);
      }

      return res;
    })
    .fail(function(resp) { 
      var serverErr = resp.responseText || {};
      if (util.isString(serverErr)) {
        try {
          serverErr = JSON.parse(serverErr);
        } catch (e) {
          serverErr = {
            errorSummary: 'Unknown error'
          };
        }
      }

      if (resp.status >= 500) {
        serverErr.errorSummary = 'Unknown error';
      }

      if (sdk.options.transformErrorXHR) {
        resp = sdk.options.transformErrorXHR(util.clone(resp));
      }

      err = new AuthApiError(serverErr, resp);

      if (err.errorCode === 'E0000011') {
        cookies.deleteCookie(STATE_TOKEN_COOKIE_NAME);
      }

      throw err;
    });
}

function get(sdk, url, saveResponse) {
  url = util.isAbsoluteUrl(url) ? url : sdk.options.url + url;
  return httpRequest(sdk, url, 'GET', undefined, !saveResponse);
}

function post(sdk, url, args, dontSaveResponse) {
  url = util.isAbsoluteUrl(url) ? url : sdk.options.url + url;
  return httpRequest(sdk, url, 'POST', args, dontSaveResponse);
}

module.exports = {
  get: get,
  post: post,
  httpRequest: httpRequest
};
