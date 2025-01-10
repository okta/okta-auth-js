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


const mocked = {
  features: {
    isBrowser: () => typeof window !== 'undefined',
    isLocalhost: () => true,
    isHTTPS: () => false,
    isPKCESupported: () => true,
    isMobileSafari18: () => false,
  },
};
jest.mock('../../../../lib/features', () => {
  return mocked.features;
});
import { OktaAuth, AuthSdkError } from '@okta/okta-auth-js';
import { prepareEnrollAuthenticatorParams }  from '../../../../lib/oidc';

const DEFAULT_ACR_VALUES = 'urn:okta:2fa:any:ifpossible';

describe('prepareEnrollAuthenticatorParams', function() {
  it('throws an error if enrollAmrValues not specified', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com'
    });
    let errorThrown = false;
    try {
      prepareEnrollAuthenticatorParams(sdk, {
        enrollAmrValues: '',
        acrValues: DEFAULT_ACR_VALUES,
      });
    } catch (err) {
      errorThrown = true;
      expect(err).toBeInstanceOf(AuthSdkError);
      expect((err as AuthSdkError).message).toEqual('enroll_amr_values must be specified');
    }
    expect(errorThrown).toBe(true);
  });

  it('throws an error if acrValues not specified', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com'
    });
    let errorThrown = false;
    try {
      prepareEnrollAuthenticatorParams(sdk, {
        enrollAmrValues: 'foo',
        acrValues: '',
      });
    } catch (err) {
      errorThrown = true;
      expect(err).toBeInstanceOf(AuthSdkError);
      expect((err as AuthSdkError).message).toEqual('acr_values must be specified');
    }
    expect(errorThrown).toBe(true);
  });

  it('sets responseType to none', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com'
    });
    const params = prepareEnrollAuthenticatorParams(sdk, {
      enrollAmrValues: ['a'],
      acrValues: DEFAULT_ACR_VALUES,
    });
    expect(params.responseType).toBe('none');
  });

  it('overrides responseType with none', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com'
    });
    const params = prepareEnrollAuthenticatorParams(sdk, {
      responseType: 'token',
      enrollAmrValues: ['a'],
      acrValues: DEFAULT_ACR_VALUES,
    });
    expect(params.responseType).toBe('none');
  });

  it('sets prompt to enroll_authenticator', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com'
    });
    const params = prepareEnrollAuthenticatorParams(sdk, {
      enrollAmrValues: ['a'],
      acrValues: DEFAULT_ACR_VALUES,
    });
    expect(params.prompt).toBe('enroll_authenticator');
  });

  it('overrides prompt with enroll_authenticator', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com'
    });
    const params = prepareEnrollAuthenticatorParams(sdk, {
      prompt: 'login',
      enrollAmrValues: ['a'],
      acrValues: DEFAULT_ACR_VALUES,
    });
    expect(params.prompt).toBe('enroll_authenticator');
  });

  it('does not prepare PKCE params', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com',
      pkce: true
    });
    spyOn(mocked.features, 'isPKCESupported').and.returnValue(true);
    const params = prepareEnrollAuthenticatorParams(sdk, {
      enrollAmrValues: ['a'],
      acrValues: DEFAULT_ACR_VALUES,
    });
    expect(params.codeVerifier).toBe(undefined);
    expect(params.codeChallenge).toBe(undefined);
    expect(params.codeChallengeMethod).toBe(undefined);
  });

  it('does not use acrValues from sdk.options', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com',
      acrValues: 'foo'
    });
    const params = prepareEnrollAuthenticatorParams(sdk, {
      enrollAmrValues: ['a'],
      acrValues: DEFAULT_ACR_VALUES,
    });
    expect(params.acrValues).toBe(DEFAULT_ACR_VALUES);
  });

  it('removes scopes, nonce', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com'
    });
    const params = prepareEnrollAuthenticatorParams(sdk, {
      enrollAmrValues: ['a'],
      acrValues: DEFAULT_ACR_VALUES,
      scopes: ['openid','email'],
      nonce: 'fake-nonce',
      maxAge: 100,
    });
    expect(params.scopes).toBe(undefined);
    expect(params.nonce).toBe(undefined);
    expect(params.maxAge).toBe(0);
  });

  it('overrides maxAge with 0', () => {
    const sdk = new OktaAuth({
      issuer: 'https://foo.com'
    });
    const params = prepareEnrollAuthenticatorParams(sdk, {
      enrollAmrValues: ['a'],
      acrValues: DEFAULT_ACR_VALUES,
      maxAge: 100,
    });
    expect(params.maxAge).toBe(0);
  });

  // Note:
  // The only suported `acrValues` is 'urn:okta:2fa:ifpossible'
  // Autorize endpoint will throw an error otherwise,
  //  but this can change in the future,
  //  so not checking this in okta-auth-js

});