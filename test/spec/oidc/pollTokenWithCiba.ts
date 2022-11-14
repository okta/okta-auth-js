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

jest.mock('../../../lib/http', () => {
  return {
    httpRequest: () => {},
  };
});

import { OktaAuthOAuthInterface } from '../../../lib/oidc/types';
import { PEM, JWK } from '@okta/test.support/jwt';

const mocked = {
  http: require('../../../lib/http')
};

import { pollTokenWithCiba } from '../../../lib/oidc';
import { AuthSdkError } from '../../../lib/errors';

function mockOktaAuth(options = {}): OktaAuthOAuthInterface {
  return {
    options: {
      issuer: 'http://fake',
      ...options,
    },
  } as unknown as OktaAuthOAuthInterface;
}

describe('pollTokenWithCiba', () => {

  it('throws if no clientId is available', async () => {
    const authClient = mockOktaAuth();
    await expect(async () => {
      await pollTokenWithCiba(authClient, { authReqId: 'fake-auth-req-id' });
    }).rejects.toThrowError(new AuthSdkError('A clientId must be specified in the OktaAuth constructor to authenticate CIBA client'));
  });

  it('throws if neither clientSecret nor privateKey is available', async () => {
    const authClient = mockOktaAuth({ clientId: 'fake-client-id' });
    await expect(async () => {
      await pollTokenWithCiba(authClient, { authReqId: 'fake-auth-req-id' });
    }).rejects.toThrowError(new AuthSdkError('A clientSecret or privateKey must be specified in the OktaAuth constructor to authenticate OIDC client'));
  });

  it('throws if no authReqId is avaiable from options', async () => {
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      clientSecret: 'fake-secret',
      scopes: ['openid'],
    });
    await expect(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore test invalid option
      await pollTokenWithCiba(authClient, {});
    }).rejects.toThrowError(new AuthSdkError('Option authReqId must be specified in the function options to poll token'));
  });

  it('support client authentication with clientSecret', async () => {
    jest.spyOn(mocked.http, 'httpRequest').mockReturnValue(Promise.resolve());
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      clientSecret: 'fake-secret',
    });

    await pollTokenWithCiba(authClient, {
      authReqId: 'fake-auth-req-id',
    });
    expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
      url: 'http://fake/oauth2/v1/token',
      method: 'POST',
      args: 'client_id=fake-client-id&client_secret=fake-secret&grant_type=urn%3Aopenid%3Aparams%3Agrant-type%3Aciba&auth_req_id=fake-auth-req-id',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
  });

  it('supports client authentication with PEM privateKey', async () => {
    jest.spyOn(mocked.http, 'httpRequest').mockReturnValue(Promise.resolve());
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      privateKey: PEM,
    });

    await pollTokenWithCiba(authClient, {
      authReqId: 'fake-auth-req-id',
    });
    expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
      url: 'http://fake/oauth2/v1/token',
      method: 'POST',
      args: expect.any(String),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    // generated jwt various in each test, assert param in queryString individually
    const { args } = mocked.http.httpRequest.mock.calls[0][1];
    const params = new URLSearchParams(args);
    expect(params.get('client_id')).toEqual('fake-client-id');
    expect(params.get('client_assertion_type')).toEqual('urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    expect(params.get('client_assertion')).toBeDefined();
    expect(params.get('grant_type')).toEqual('urn:openid:params:grant-type:ciba');
    expect(params.get('auth_req_id')).toEqual('fake-auth-req-id');
  });

  it('supports client authentication with JWK privateKey', async () => {
    jest.spyOn(mocked.http, 'httpRequest').mockReturnValue(Promise.resolve());
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      privateKey: JWK,
      scopes: ['openid', 'email'],
    });

    await pollTokenWithCiba(authClient, {
      authReqId: 'fake-auth-req-id',
    });
    expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
      url: 'http://fake/oauth2/v1/token',
      method: 'POST',
      args: expect.any(String),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    // generated jwt various in each test, assert param in queryString individually
    const { args } = mocked.http.httpRequest.mock.calls[0][1];
    const params = new URLSearchParams(args);
    expect(params.get('client_id')).toEqual('fake-client-id');
    expect(params.get('client_assertion_type')).toEqual('urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    expect(params.get('client_assertion')).toBeDefined();
    expect(params.get('grant_type')).toEqual('urn:openid:params:grant-type:ciba');
    expect(params.get('auth_req_id')).toEqual('fake-auth-req-id');
  });

});
