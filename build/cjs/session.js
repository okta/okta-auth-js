"use strict";

exports.sessionExists = sessionExists;
exports.getSession = getSession;
exports.closeSession = closeSession;
exports.refreshSession = refreshSession;
exports.setCookieAndRedirect = setCookieAndRedirect;

var _util = require("./util");

var _http = require("./http");

/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

/* global window */
function sessionExists(sdk) {
  return sdk.session.get().then(function (res) {
    if (res.status === 'ACTIVE') {
      return true;
    }

    return false;
  }).catch(function () {
    return false;
  });
}

function getSession(sdk) {
  return (0, _http.get)(sdk, '/api/v1/sessions/me', {
    withCredentials: true
  }).then(function (session) {
    var res = (0, _util.omit)(session, '_links');

    res.refresh = function () {
      return (0, _http.post)(sdk, (0, _util.getLink)(session, 'refresh').href, {}, {
        withCredentials: true
      });
    };

    res.user = function () {
      return (0, _http.get)(sdk, (0, _util.getLink)(session, 'user').href, {
        withCredentials: true
      });
    };

    return res;
  }).catch(function () {
    // Return INACTIVE status on failure
    return {
      status: 'INACTIVE'
    };
  });
}

function closeSession(sdk) {
  return (0, _http.httpRequest)(sdk, {
    url: sdk.getIssuerOrigin() + '/api/v1/sessions/me',
    method: 'DELETE',
    withCredentials: true
  });
}

function refreshSession(sdk) {
  return (0, _http.post)(sdk, '/api/v1/sessions/me/lifecycle/refresh', {}, {
    withCredentials: true
  });
}

function setCookieAndRedirect(sdk, sessionToken, redirectUrl) {
  redirectUrl = redirectUrl || window.location.href;
  window.location.assign(sdk.getIssuerOrigin() + '/login/sessionCookieRedirect' + (0, _util.toQueryString)({
    checkAccountSetupComplete: true,
    token: sessionToken,
    redirectUrl: redirectUrl
  }));
}
//# sourceMappingURL=session.js.map