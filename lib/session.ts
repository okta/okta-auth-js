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
import { omit, getLink, toQueryParams } from './util';
import http from './http';

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

function getSession(sdk) { 
  return http.get(sdk, '/api/v1/sessions/me')
  .then(function(session) {
    var res = omit(session, '_links');

    res.refresh = function() {
      return http.post(sdk, getLink(session, 'refresh').href);
    };

    res.user = function() {
      return http.get(sdk, getLink(session, 'user').href);
    };

    return res;
  })
  .catch(function() {
    // Return INACTIVE status on failure
    return {status: 'INACTIVE'};
  });
}

function closeSession(sdk) {
  return http.httpRequest(sdk, {
    url: sdk.getIssuerOrigin() + '/api/v1/sessions/me',
    method: 'DELETE'
  });
}

function refreshSession(sdk) {
  return http.post(sdk, '/api/v1/sessions/me/lifecycle/refresh');
}

function setCookieAndRedirect(sdk, sessionToken, redirectUrl) {
  redirectUrl = redirectUrl || window.location.href;
  window.location.assign(sdk.getIssuerOrigin() + '/login/sessionCookieRedirect' +
    toQueryParams({
      checkAccountSetupComplete: true,
      token: sessionToken,
      redirectUrl: redirectUrl
    }));
}

export {
  sessionExists,
  getSession,
  closeSession,
  refreshSession,
  setCookieAndRedirect
};
