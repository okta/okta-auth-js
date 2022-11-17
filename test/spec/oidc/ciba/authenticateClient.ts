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

jest.mock('../../../../lib/http', () => {
  return {
    httpRequest: () => {},
  };
});

import { OktaAuthOAuthInterface } from '../../../../lib/oidc/types';
import { PEM, JWK } from '@okta/test.support/jwt.mjs';

const mocked = {
  http: require('../../../../lib/http')
};

import { authenticateClient } from '../../../../lib/oidc/ciba';
import { AuthSdkError } from '../../../../lib/errors';

function mockOktaAuth(options = {}): OktaAuthOAuthInterface {
  return {
    options: {
      issuer: 'http://fake',
      ...options,
    },
  } as unknown as OktaAuthOAuthInterface;
}

describe('authenticateWithCiba', () => {

  it('throws if no clientId is available', async () => {
    const authClient = mockOktaAuth();
    await expect(async () => {
      await authenticateClient(authClient, {});
    }).rejects.toThrowError(new AuthSdkError('A clientId must be specified in the OktaAuth constructor to authenticate CIBA client'));
  });

  it('throws if neither clientSecret nor privateKey is available', async () => {
    const authClient = mockOktaAuth({ clientId: 'fake-client-id' });
    await expect(async () => {
      await authenticateClient(authClient, {});
    }).rejects.toThrowError(new AuthSdkError('A clientSecret or privateKey must be specified in the OktaAuth constructor to authenticate OIDC client'));
  });

  it('throws if no openid in scopes', async () => {
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      clientSecret: 'fake-secret',
      scopes: [],
    });
    await expect(async () => {
      await authenticateClient(authClient, {});
    }).rejects.toThrowError(new AuthSdkError('openid scope must be specified in the scopes argument to authenticate CIBA client'));
  });

  it('throws if neither loginHint nor idTokenHint is avaiable from options', async () => {
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      clientSecret: 'fake-secret',
      scopes: ['openid'],
    });
    await expect(async () => {
      await authenticateClient(authClient, {});
    }).rejects.toThrowError(new AuthSdkError('A loginHint or idTokenHint must be specified in the function options to authenticate CIBA client'));
  });

  it('supports client authentication with client secret and loginHint', async () => {
    jest.spyOn(mocked.http, 'httpRequest').mockReturnValue(Promise.resolve());
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      clientSecret: 'fake-secret',
      scopes: ['openid', 'email'],
    });

    await authenticateClient(authClient, {
      loginHint: 'user@test.com',
    });
    expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
      url: 'http://fake/oauth2/v1/bc/authorize',
      method: 'POST',
      args: 'client_id=fake-client-id&client_secret=fake-secret&scope=openid%20email&login_hint=user%40test.com',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
  });

  it('supports client authentication with client secret and idTokenHint', async () => {
    jest.spyOn(mocked.http, 'httpRequest').mockReturnValue(Promise.resolve());
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      clientSecret: 'fake-secret',
      scopes: ['openid', 'email'],
    });

    await authenticateClient(authClient, {
      idTokenHint: 'fake-id-token',
    });
    expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
      url: 'http://fake/oauth2/v1/bc/authorize',
      method: 'POST',
      args: 'client_id=fake-client-id&client_secret=fake-secret&scope=openid%20email&id_token_hint=fake-id-token',
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
      scopes: ['openid', 'email'],
    });

    await authenticateClient(authClient, {
      loginHint: 'user@test.com',
    });
    expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
      url: 'http://fake/oauth2/v1/bc/authorize',
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
    expect(params.get('scope')).toEqual('openid email');
    expect(params.get('login_hint')).toEqual('user@test.com');
  });

  it('supports client authentication with JWK privateKey', async () => {
    jest.spyOn(mocked.http, 'httpRequest').mockReturnValue(Promise.resolve());
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      privateKey: JWK,
      scopes: ['openid', 'email'],
    });

    await authenticateClient(authClient, {
      loginHint: 'user@test.com',
    });
    expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
      url: 'http://fake/oauth2/v1/bc/authorize',
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
    expect(params.get('scope')).toEqual('openid email');
    expect(params.get('login_hint')).toEqual('user@test.com');
  });

  it('allows optional options', async () => {
    jest.spyOn(mocked.http, 'httpRequest').mockReturnValue(Promise.resolve());
    const authClient = mockOktaAuth({
      clientId: 'fake-client-id',
      privateKey: JWK,
      scopes: ['openid', 'email'],
    });

    await authenticateClient(authClient, {
      loginHint: 'user@test.com',
      acrValues: 'fake:acr',
      bindingMessage: 'fake-binding-message',
      requestExpiry: 100,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore test invalid option
      invalidOption: 'invalid',
    });
    expect(mocked.http.httpRequest).toHaveBeenCalledWith(authClient, {
      url: 'http://fake/oauth2/v1/bc/authorize',
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
    expect(params.get('scope')).toEqual('openid email');
    expect(params.get('login_hint')).toEqual('user@test.com');
    expect(params.get('acr_values')).toEqual('fake:acr');
    expect(params.get('binding_message')).toEqual('fake-binding-message');
    expect(params.get('request_expiry')).toEqual('100');
    // query string should only include allowed options
    expect(params.has('invalid_option')).toBeFalsy();
    expect(params.has('invalidOption')).toBeFalsy();
  });

});
