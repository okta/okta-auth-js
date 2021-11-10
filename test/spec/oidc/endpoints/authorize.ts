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

import { buildAuthorizeParams } from '../../../../lib/oidc/endpoints';
import { AuthSdkError } from '../../../../lib/errors';

describe('authorize endpoint', () => {

  describe('buildAuthorizeParams', () => {

    it('throws if no clientId', () => {
      expect(() => buildAuthorizeParams({})).toThrow(new AuthSdkError('A clientId must be specified in the OktaAuth constructor to get a token'));
    });

    it('throws if multiple response types are specified as string', () => {
      expect(() => buildAuthorizeParams({
        clientId: 'fakeClientId',
        responseType: 'id_token token'
      })).toThrow(new AuthSdkError('Multiple OAuth responseTypes must be defined as an array'));
    });

    it('converts tokenParams to query params', () => {
      expect(buildAuthorizeParams({
        clientId: 'fakeClientId',
        codeChallenge: 'fakeCodeChallenge',
        responseType: 'id_token',
        scopes: ['openid', 'email']
      })).toBe('?client_id=fakeClientId&code_challenge=fakeCodeChallenge&response_type=id_token&scope=openid%20email');
    });

    it('converts array parameters "idpScope", "responseType", and "scopes" to space-separated string', () => {
      expect(buildAuthorizeParams({
        clientId: 'fakeClientId',
        codeChallenge: 'fakeCodeChallenge',
        scopes: ['openid', 'email'],
        idpScope: ['scope1', 'scope2'],
        responseType: ['id_token', 'token']
      })).toBe('?client_id=fakeClientId&code_challenge=fakeCodeChallenge&idp_scope=scope1%20scope2&response_type=id_token%20token&scope=openid%20email');
    });

    it('throws if responseType includes id_token but scopes does not include openid', () => {
      expect(() => buildAuthorizeParams({
        clientId: 'fakeClientId',
        codeChallenge: 'fakeCodeChallenge',
        scopes: ['email'],
        idpScope: ['scope1', 'scope2'],
        responseType: ['id_token', 'token']
      })).toThrow(new AuthSdkError('openid scope must be specified in the scopes argument when requesting an id_token'));
    });

    it('can add extraParams to the authorize url', () => {
      expect(buildAuthorizeParams({
        clientId: 'fakeClientId',
        codeChallenge: 'fakeCodeChallenge',
        scopes: ['openid', 'email'],
        responseType: ['id_token', 'token'],
        extraParams: {
          launch: 'launch'
        }
      })).toBe('?client_id=fakeClientId&code_challenge=fakeCodeChallenge&response_type=id_token%20token&scope=openid%20email&launch=launch');
    });
  });
});
