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


import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import util from '@okta/test.support/util';
import http from '../../../../lib/http';

import { postToTokenEndpoint } from '../../../../lib/oidc/endpoints/token';
import factory from '@okta/test.support/factory';

describe('token endpoint', function() {
  var ISSUER = 'http://example.okta.com';
  var REDIRECT_URI = 'http://fake.local';
  var CLIENT_ID = 'fake';
  var endpoint = '/oauth2/v1/token';
  var codeVerifier = 'superfake';
  var authorizationCode = 'notreal';

  util.itMakesCorrectRequestResponse({
    title: 'requests a token',
    setup: {
      issuer: ISSUER,
      bypassCrypto: true,
      calls: [
        {
          request: {
            method: 'post',
            uri: endpoint,
            withCredentials: false,
            data: {
              client_id: CLIENT_ID,
              grant_type: 'authorization_code',
              redirect_uri: REDIRECT_URI
            },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Okta-User-Agent-Extended': global['USER_AGENT']
            }
          },
          response: 'pkce-token-success',
          responseVars: {
            scope: 'also fake',
            accessToken: 'fake access token',
            idToken: factory.buildIDToken({
              issuer: ISSUER,
              clientId: CLIENT_ID
            })
          }
        }
      ]
    },
    execute: function (test) {
      return postToTokenEndpoint(test.oa, {
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        authorizationCode: authorizationCode,
        codeVerifier: codeVerifier,
      }, {
        tokenUrl: ISSUER + endpoint
      });
    }
  });

  describe('validateOptions', function() {
    var authClient;
    var oauthOptions;

    beforeEach(function() {
      spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
      authClient = new OktaAuth({
        issuer: 'https://auth-js-test.okta.com'
      });

      oauthOptions = {
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        authorizationCode: authorizationCode,
        codeVerifier: codeVerifier,
      };
    });

    it('Does not throw if options are valid', function() {
      var httpRequst = jest.spyOn(http, 'httpRequest').mockImplementation();
      var urls = {
        tokenUrl: 'http://superfake'
      };
      postToTokenEndpoint(authClient, oauthOptions, urls);
      expect(httpRequst).toHaveBeenCalled();
    });

    it('Throws if no clientId', function() {
      oauthOptions.clientId = undefined;
      try {
        postToTokenEndpoint(authClient, oauthOptions, null);
      } catch(e) {
        expect(e instanceof AuthSdkError).toBe(true);
        expect(e.message).toBe('A clientId must be specified in the OktaAuth constructor to get a token');
      }
    });

    it('Throws if no redirectUri', function() {
      oauthOptions.redirectUri = undefined;
      try {
        postToTokenEndpoint(authClient, oauthOptions, null);
      } catch(e) {
        expect(e instanceof AuthSdkError).toBe(true);
        expect(e.message).toBe('The redirectUri passed to /authorize must also be passed to /token');
      }
    });

    it('Throws if no authorizationCode', function() {
      oauthOptions.authorizationCode = undefined;
      try {
        postToTokenEndpoint(authClient, oauthOptions, null);
      } catch(e) {
        expect(e instanceof AuthSdkError).toBe(true);
        expect(e.message).toBe('An authorization code (returned from /authorize) must be passed to /token');
      }
    });

    it('Throws if no codeVerifier', function() {
      oauthOptions.codeVerifier = undefined;
      try {
        postToTokenEndpoint(authClient, oauthOptions, null);
      } catch(e) {
        expect(e instanceof AuthSdkError).toBe(true);
        expect(e.message).toBe('The "codeVerifier" (generated and saved by your app) must be passed to /token');
      }
    });

  });
});