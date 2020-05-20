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


/**
 * @typedef {OktaAuth.OAuthParams} OAuthParams
 * @typedef {OktaAuth.SessionObject} SessionObject
 */

/* global window */
var util = require('./util');
var http = require('./http');

/**
 * @param {OktaAuth} sdk 
 */
function sessionExists(sdk) {
  return sdk.session.get()
    .then(function(res) {
      if (res.status === 'ACTIVE') {
        return true;
      }
      return false;
    })
    .catch(function() {
      return false;
    });
}

/**
 * @param {OktaAuth} sdk
 * @returns {Promise<SessionObject>}
 */
function getSession(sdk) { 
  return http.get(sdk, '/api/v1/sessions/me')
  .then(function(session) {
    /** @type {SessionObject} */
    var res = util.omit(session, '_links');

    res.refresh = function() {
      return http.post(sdk, util.getLink(session, 'refresh').href);
    };

    res.user = function() {
      return http.get(sdk, util.getLink(session, 'user').href);
    };

    return res;
  })
  .catch(function() {
    // Return INACTIVE status on failure
    return /** @type {SessionObject} */({status: 'INACTIVE'});
  });
}

/**
 * @param {OktaAuth} sdk
 */
function closeSession(sdk) {
  return http.httpRequest(sdk, {
    url: sdk.getIssuerOrigin() + '/api/v1/sessions/me',
    method: 'DELETE'
  });
}

/**
 * @param {OktaAuth} sdk
 */
function refreshSession(sdk) {
  return http.post(sdk, '/api/v1/sessions/me/lifecycle/refresh');
}

/**
 * @param {OktaAuth} sdk
 * @param {string=} sessionToken
 * @param {string=} redirectUrl
 */
function setCookieAndRedirect(sdk, sessionToken = null, redirectUrl = null) {
  redirectUrl = redirectUrl || window.location.href;
  window.location.assign(sdk.getIssuerOrigin() + '/login/sessionCookieRedirect' +
    util.toQueryParams({
      checkAccountSetupComplete: true,
      token: sessionToken,
      redirectUrl: redirectUrl
    }));
}

module.exports = {
  sessionExists: sessionExists,
  getSession: getSession,
  closeSession: closeSession,
  refreshSession: refreshSession,
  setCookieAndRedirect: setCookieAndRedirect
};
