/* eslint-disable complexity */
var util = require('./util');
var cookies = require('./cookies');
var storageUtil = require('./storageUtil');
var Q = require('q');
var AuthApiError = require('./errors/AuthApiError');
var config = require('./config');

function httpRequest(sdk, options) {
  options = options || {};
  var url = options.url,
      method = options.method,
      args = options.args,
      saveAuthnState = options.saveAuthnState,
      accessToken = options.accessToken,
      httpCache = storageUtil.getHttpCache();

  if (options.cacheResponse) {
    var cacheContents = httpCache.getStorage();
    var cachedResponse = cacheContents[url];
    if (cachedResponse && Date.now()/1000 < cachedResponse.expiresAt) {
      return Q.resolve(cachedResponse.response);
    }
  }

  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Okta-User-Agent-Extended': sdk.userAgent
  };
  util.extend(headers, sdk.options.headers, options.headers);

  if (accessToken && util.isString(accessToken)) {
    headers['Authorization'] = 'Bearer ' + accessToken;
  }

  var ajaxOptions = {
    headers: headers,
    data: args || undefined
  };

  var err, res;
  return new Q(sdk.options.ajaxRequest(method, url, ajaxOptions))
    .then(function(resp) {
      res = resp.responseText;
      if (res && util.isString(res)) {
        res = JSON.parse(res);
      }

      if (saveAuthnState) {
        if (!res.stateToken) {
          cookies.deleteCookie(config.STATE_TOKEN_COOKIE_NAME);
        }
      }

      if (res && res.stateToken && res.expiresAt) {
        cookies.setCookie(config.STATE_TOKEN_COOKIE_NAME, res.stateToken, res.expiresAt);
      }

      if (res && options.cacheResponse) {
        httpCache.updateStorage(url, {
          expiresAt: Math.floor(Date.now()/1000) + config.DEFAULT_CACHE_DURATION,
          response: res
        });
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
        cookies.deleteCookie(config.STATE_TOKEN_COOKIE_NAME);
      }

      throw err;
    });
}

function get(sdk, url, options) {
  url = util.isAbsoluteUrl(url) ? url : sdk.options.url + url;
  var getOptions = {
    url: url,
    method: 'GET'
  };
  util.extend(getOptions, options);
  return httpRequest(sdk, getOptions);
}

function post(sdk, url, args, options) {
  url = util.isAbsoluteUrl(url) ? url : sdk.options.url + url;
  var postOptions = {
    url: url,
    method: 'POST',
    args: args,
    saveAuthnState: true
  };
  util.extend(postOptions, options);
  return httpRequest(sdk, postOptions);
}

module.exports = {
  get: get,
  post: post,
  httpRequest: httpRequest
};
