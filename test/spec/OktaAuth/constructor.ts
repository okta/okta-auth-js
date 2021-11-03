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


/* eslint-disable complexity */
import { 
  OktaAuth
} from '@okta/okta-auth-js';

jest.mock('../../../lib/features', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...jest.requireActual('../../../lib/features') as any,
    isBrowser: () => {}
  };
});

const mocked = {
  features: require('../../../lib/features')
};

describe('OktaAuth (constructor)', () => {
  const apiUrlOptions = [
    'issuer',
    'tokenUrl',
    'authorizeUrl',
    'userinfoUrl',
    'revokeUrl',
    'logoutUrl',
  ];

  const fnOptions = [
    'httpRequestClient',
    'transformErrorXHR',
    'transformAuthState',
    'restoreOriginalUri',
  ];

  const objOptions = [
    'storageManager',
    'cookies'
  ];

  const savedOptions = apiUrlOptions
  .concat(fnOptions)
  .concat(objOptions)
  .concat([
    'clientId',
    'redirectUri',
    'useInteractionCodeFlow',
    'state',
    'scopes',
    'postLogoutRedirectUri',
    'responseMode',
    'responseType',
    'pkce',
    'headers',
    'devMode',
    'ignoreSignature',
    'ignoreLifetime',
    'storageUtil',
  ]);

  it('saves expected options', () => {
    const config = {};
    savedOptions.forEach((option) => {
      let val: string | object | boolean = 'fake_' + option; // default "fake" value
      switch (option) { // some types are strictly enforced. These should differ from the default
        case 'issuer':
        case 'redirectUri':
          val = 'http://' + val;
          break;
        case 'storageManager':
          val = {
            cache: {
              storageTypes: ['a']
            },
            token: {
              storageTypes: ['a', 'b']
            },
            transaction: {
              storageTypes: ['a', 'b']
            }
          };
          break;
        case 'cookies':
          val = { secure: false };
          break;
        case 'storageUtil':
          val = {
            findStorageType: () => {},
            getStorageByType: () => {
              return {};
            }
          };
          break;
        case 'ignoreSignature':
        case 'ignoreLifetime':
        case 'devMode':
          val = true;
          break;
        case 'pkce':
          val = false;
          break;
        case 'scopes':
          val = [val];
          break;
      }
      config[option] = val;
    });
    const oa = new OktaAuth(config);
    savedOptions.forEach((option) => {
      expect(oa.options[option]).toEqual(config[option]);
    });
  });

  it('removes trailing slash from api urls', () => {
    const config = {};
    apiUrlOptions.forEach((option) => {
      config[option] = 'http://fake_' + option + '/';
    });
    const oa = new OktaAuth(config);
    apiUrlOptions.forEach((option) => {
      expect(oa.options[option] + '/').toBe(config[option]);
    });
  });

  it('accepts some options as functions', () => {
    const config = { issuer: 'http://fake' };
    fnOptions.forEach((option) => {
      config[option] = function () {};
    });
    const oa = new OktaAuth(config);
    fnOptions.forEach((option) => {
      expect(oa.options[option]).toBe(config[option]);
    });
  });

  describe('AuthStateManager', () => {
    it('initials authStateManager', () => {
      const config = { issuer: 'http://fake' };
      const oa = new OktaAuth(config);
      expect(oa.authStateManager).toBeDefined();
    });
  });

  // TODO: remove in 6.0
  describe('userAgent', () => {
    let sdkVersion;
    beforeEach(async () => {
      sdkVersion = (await import('../../../package.json')).version;
    });

    // browser env is tested in "./browser.ts"
    it('initials userAgent field for node env', () => {
      jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(false);
      const config = { issuer: 'http://fake' };
      const oa = new OktaAuth(config);
      expect(oa.userAgent).toBe(`okta-auth-js-server/${sdkVersion}`);
    });
  });

});
