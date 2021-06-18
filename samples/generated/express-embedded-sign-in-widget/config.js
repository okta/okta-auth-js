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
env.setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file

module.exports = function () {
  const { 
    CLIENT_ID,
    CLIENT_SECRET,
    ISSUER,
    OKTA_TESTING_DISABLEHTTPSCHECK = false,
  } = process.env;

  return {
    webServer: {
      port: 8080,
      oidc: {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        issuer: ISSUER,
        appBaseUrl: 'http://localhost:8080',
        scopes: ['openid', 'profile', 'email'],
        redirectUri: 'http://localhost:8080/login/callback',
        postLogoutRedirectUri: 'http://localhost:8080',
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      },
      resourceServer: {
        messagesUrl: 'http://localhost:8000/api/messages',
      },
    },
    resourceServer: {
      port: 8000,
      oidc: {
        clientId: CLIENT_ID,
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      },
      assertClaims: {
        aud: 'api://default',
        cid: CLIENT_ID
      }
    }
  };
};
