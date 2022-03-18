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
 */


const env = require('./env')();
env.setEnvironmentVarsFromTestEnv(__dirname);

module.exports = function () {
  const { 
    CLIENT_ID,
    CLIENT_SECRET,
    ISSUER,
    OKTA_TESTING_DISABLEHTTPSCHECK = false,
    APP_PORT = 8080,
    APP_BASE_URL = `http://localhost:${APP_PORT}`,
    REDIRECT_URI = `http://localhost:${APP_PORT}/login/callback`,
    POST_LOGOUT_REDIRECT_URI = `http://localhost:${APP_PORT}`,
  } = process.env;

  return {
    webServer: {
      port: APP_PORT,
      oidc: {
        clientId: CLIENT_ID || '',
        clientSecret: CLIENT_SECRET || '',
        issuer: ISSUER || '',
        appBaseUrl: APP_BASE_URL,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: REDIRECT_URI,
        postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      },
    }
  };
};
