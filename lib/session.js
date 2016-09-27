var util = require('./util');
var http = require('./http');

function sessionExists(sdk) {
  return sdk.session.get()
    .then(function(res) {
      if (res.status === 'ACTIVE') {
        return true;
      }
      return false;
    })
    .fail(function() {
      return false;
    });
}

function getSession(sdk) { 
  return http.get(sdk, '/api/v1/sessions/me')
  .then(function(session) {
    var res = util.omit(session, '_links');

    res.refresh = function() {
      return http.post(sdk, util.getLink(session, 'refresh').href);
    };

    res.user = function() {
      return http.get(sdk, util.getLink(session, 'user').href);
    };

    return res;
  })
  .fail(function() {
    // Return INACTIVE status on failure
    return {status: 'INACTIVE'};
  });
}

function closeSession(sdk) {
  return http.httpRequest(sdk, {
    url: sdk.options.url + '/api/v1/sessions/me',
    method: 'DELETE'
  });
}

function refreshSession(sdk) {
  return http.post(sdk, '/api/v1/sessions/me/lifecycle/refresh');
}

function setCookieAndRedirect(sdk, sessionToken, redirectUrl) {
  redirectUrl = redirectUrl || window.location.href;
  window.location = sdk.options.url + '/login/sessionCookieRedirect' +
    util.toQueryParams({
      checkAccountSetupComplete: true,
      token: sessionToken,
      redirectUrl: redirectUrl
    });
}

module.exports = {
  sessionExists: sessionExists,
  getSession: getSession,
  closeSession: closeSession,
  refreshSession: refreshSession,
  setCookieAndRedirect: setCookieAndRedirect
};
