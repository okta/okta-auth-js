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


/* eslint-disable @typescript-eslint/no-explicit-any */
/* global window */
const mocked = {
  features: {
    isBrowser: () => { return false; }
  }
};
jest.mock('lib/features',() => {
  return mocked.features;
});
import { getDefaultTokenParams } from '../../../../lib/oidc/util/defaultTokenParams';
import { OktaAuthOAuthInterface } from '../../../../lib/oidc/types';

describe('getDefaultTokenParams', () => {
  beforeEach(() => {
    if (typeof global.window === 'undefined') {
      global.window = {
        fake: true,
        location: {
          href: 'fake'
        } as Location
      } as any;
    }
  });
  afterEach(() => {
    if ((global.window as any).fake) {
      delete (global as any).window;
    }
  });
  it('`pkce`: uses value from sdk.options', () => {
    const sdk = { options: { pkce: true } } as OktaAuthOAuthInterface;
    expect(getDefaultTokenParams(sdk).pkce).toBe(true);
  });
  
  it('`clientId`: uses value from sdk.options', () => {
    const sdk = { options: { clientId: 'abc' } } as OktaAuthOAuthInterface;
    expect(getDefaultTokenParams(sdk).clientId).toBe('abc');
  });
  
  describe('`redirectUri`: ', () => {
    it('isBrowser: defaults to window.location.href', () => {
      jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(true);
      expect(window.location.href).toBeTruthy();
      expect(getDefaultTokenParams({ options: {} } as OktaAuthOAuthInterface).redirectUri).toBe(window.location.href);
    });
    it('uses values from sdk.options', () => {
      const sdk = { options: { redirectUri: 'abc' } } as OktaAuthOAuthInterface;
      expect(getDefaultTokenParams(sdk).redirectUri).toBe('abc');
    });
  });
  
  describe('`responseType`: ', () => {
    it('defaults to ["token", "id_token"]', () => {
      expect(getDefaultTokenParams({ options: {} } as OktaAuthOAuthInterface).responseType).toEqual(['token', 'id_token']);
    });
    it('uses values from sdk.options', () => {
      const sdk = { options: { responseType: 'code' } } as OktaAuthOAuthInterface;
      expect(getDefaultTokenParams(sdk).responseType).toBe('code');
    });
  });

  it('`responseMode`: uses value from sdk.options', () => {
    const sdk = { options: { responseMode: 'fragment' } } as OktaAuthOAuthInterface;
    expect(getDefaultTokenParams(sdk).responseMode).toBe('fragment');
  });

  describe('`state`: ', () => {
    it('generates a default value', () => {
      expect(getDefaultTokenParams({ options: {} } as OktaAuthOAuthInterface).state).toBeTruthy();
    });
    it('uses values from sdk.options', () => {
      const sdk = { options: { state: 'abc' } } as OktaAuthOAuthInterface;
      expect(getDefaultTokenParams(sdk).state).toBe('abc');
    });
  });

  it('`nonce`: generates a default value', () => {
    expect(getDefaultTokenParams({ options: {} } as OktaAuthOAuthInterface).nonce).toBeTruthy();
  });
  
  it('`acrValues`: uses value from sdk.options', () => {
    const sdk = { options: { acrValues: 'foo' } } as OktaAuthOAuthInterface;
    expect(getDefaultTokenParams(sdk).acrValues).toBe('foo');
  });
  
  it('`maxAge`: uses value from sdk.options', () => {
    const sdk = { options: { maxAge: 900 } } as OktaAuthOAuthInterface;
    expect(getDefaultTokenParams(sdk).maxAge).toBe(900);
  });
});