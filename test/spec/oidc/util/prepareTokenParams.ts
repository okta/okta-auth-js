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
    isIE11OrLess: () => false,
    isHTTPS: () => false,
    isPKCESupported: () => true,
    hasTextEncoder: () => true
  },
  wellKnown: {
    getWellKnown: (): Promise<unknown> => Promise.resolve()
  }
};
jest.mock('../../../../lib/features', () => {
  return mocked.features;
});
jest.mock('../../../../lib/oidc/endpoints/well-known', () => {
  return mocked.wellKnown;
});
import { OktaAuth } from '../../../../lib';
import { prepareTokenParams, pkce }  from '../../../../lib/oidc';
import TransactionManager from '../../../../lib/TransactionManager';

describe('prepareTokenParams', function() {

  it('throws an error if pkce is true and PKCE is not supported', function() {
    spyOn(mocked.features, 'isPKCESupported').and.returnValue(false);
    var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: false });
    return prepareTokenParams(sdk, {
      pkce: true,
    })
    .then(function() {
      // Should never hit this
      expect(true).toBe(false);
    })
    .catch(function (e) {
      expect(e.name).toEqual('AuthSdkError');
      expect(e.errorSummary).toEqual(
        'PKCE requires a modern browser with encryption support running in a secure context.\n' +
        'The current page is not being served with HTTPS protocol. PKCE requires secure HTTPS protocol.'
      );
    });
  });
  
  describe('responseType', function() {
    it('Is set to "code" if pkce is true', function() {
      spyOn(mocked.features, 'isPKCESupported').and.returnValue(true);
      jest.spyOn(mocked.wellKnown, 'getWellKnown').mockReturnValue(Promise.resolve({
        code_challenge_methods_supported: ['S256']
      }));

      spyOn(pkce, 'generateVerifier').and.returnValue(Promise.resolve());
      spyOn(TransactionManager.prototype, 'save').and.callThrough();
      spyOn(pkce, 'computeChallenge').and.returnValue(Promise.resolve());
      
      var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: true });
      return prepareTokenParams(sdk, {
        responseType: 'token'
      })
      .then(function(params) {
        expect(params.responseType).toBe('code');
      });

    });
  });

  it('Checks codeChallengeMethod against well-known', function() {
    spyOn(mocked.features, 'isPKCESupported').and.returnValue(true);
    var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: true });
    jest.spyOn(mocked.wellKnown, 'getWellKnown').mockReturnValue(Promise.resolve({
      'code_challenge_methods_supported': []
    }));
    return prepareTokenParams(sdk, {})
    .then(function() {
      expect(false).toBe(true); // should not reach this line
    })
    .catch(function(e) {
      expect(e.name).toBe('AuthSdkError');
      expect(e.errorSummary).toBe('Invalid code_challenge_method');
    });
  });

  it('Computes and returns a code challenge', function() {
    var codeChallengeMethod = 'fake';
    var codeVerifier = 'alsofake';
    var codeChallenge = 'ohsofake';

    spyOn(mocked.features, 'isPKCESupported').and.returnValue(true);
    var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: true });
    jest.spyOn(mocked.wellKnown, 'getWellKnown').mockReturnValue(Promise.resolve({
      'code_challenge_methods_supported': [codeChallengeMethod]
    }));
    spyOn(pkce, 'generateVerifier').and.returnValue(codeVerifier);
    spyOn(TransactionManager.prototype, 'save').and.callThrough();
    spyOn(pkce, 'computeChallenge').and.returnValue(Promise.resolve(codeChallenge));
    return prepareTokenParams(sdk, {
      codeChallengeMethod: codeChallengeMethod
    })
    .then(function(oauthParams) {
      expect(oauthParams.codeChallenge).toBe(codeChallenge);
    });
  });
  
});