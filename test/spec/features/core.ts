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


const modulesToMock = {
  crypto: '../../../lib/crypto'
};

const mocked = {
  crypto: {
    webcrypto: null
  }
};

jest.doMock(modulesToMock.crypto, () => {
  return mocked.crypto;
});

import { OktaAuth } from '@okta/okta-auth-js';

describe('features', function() {

  describe('functions exist', function() {
    var funcs = [
      'isBrowser',
      'isIE11OrLess',
      'getUserAgent',
      'isFingerprintSupported',
      'isPopupPostMessageSupported',
      'isTokenVerifySupported',
      'hasTextEncoder',
      'isPKCESupported',
      'isHTTPS',
      'isLocalhost'
    ];

    it('on prototype', function() {
      var auth = new OktaAuth({
        pkce: false,
        issuer: 'https://fakeo'
      });

      funcs.forEach(function(fname)  {
        var fn = auth.features[fname];
        expect(typeof fn).toBe('function');
      });
    });
  
    it('on static type', function()  {
      funcs.forEach(function(fname) {
        var fn = OktaAuth.features[fname];
        expect(typeof fn).toBe('function');
      });
    });
  });

  describe('behavior', function() {
    let orig: Record<string, unknown> = {};
    beforeEach(() => {
      orig.Uint8Array = global.Uint8Array;
      orig.TextEncoder = global.TextEncoder;
      mocked.crypto.webcrypto = { subtle: {} };
    });
    afterEach(() => {
      global.Uint8Array = orig.Uint8Array as unknown  as Uint8ArrayConstructor;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.TextEncoder = orig.TextEncoder as unknown as any;
    });


    describe('isTokenVerifySupported', function() {
      it('can succeed', function() {
        expect(OktaAuth.features.isTokenVerifySupported()).toBe(true);
      });

      it('fails if no webcrypto', function() {
        mocked.crypto.webcrypto = undefined;
        expect(OktaAuth.features.isTokenVerifySupported()).toBe(false);
      });

      it('fails if no webcrypto.subtle', function() {
        mocked.crypto.webcrypto = {};
        expect(OktaAuth.features.isTokenVerifySupported()).toBe(false);
      });

      it('fails if no Uint8Array', function() {
        delete global.Uint8Array;
        expect(OktaAuth.features.isTokenVerifySupported()).toBe(false);
      });
    });

    describe('hasTextEncoder', function() {
      it('returns true if TextEncoder is defined', function() {
        expect(OktaAuth.features.hasTextEncoder()).toBe(true);
      });
      it('returns false if TextEncoder is undefined', function() {
        delete global.TextEncoder;
        expect(OktaAuth.features.hasTextEncoder()).toBe(false);
      });
    });

    describe('isPKCESupported', function() {
      it('can succeed', function() {
        expect(OktaAuth.features.isPKCESupported()).toBe(true);
      });

      it('fails if no webcrypto', function() {
        mocked.crypto.webcrypto = undefined;
        expect(OktaAuth.features.isPKCESupported()).toBe(false);
      });

      it('fails if no webcrypto.subtle', function() {
        mocked.crypto.webcrypto = {};
        expect(OktaAuth.features.isPKCESupported()).toBe(false);
      });

      it('fails if no Uint8Array', function() {
        delete global.Uint8Array;
        expect(OktaAuth.features.isPKCESupported()).toBe(false);
      });

      it('fails if no TextEncoder', function() {
        delete global.TextEncoder;
        expect(OktaAuth.features.isPKCESupported()).toBe(false);
      });

      it('rejects with an error when calling getToken if pkce is true and PKCE is not supported', function () {
        var err;
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
        spyOn(OktaAuth.features, 'isHTTPS').and.returnValue(true);
        var auth = new OktaAuth({
          issuer: 'https://dev-12345.oktapreview.com',
          pkce: true,
        });

        return auth.token.getWithRedirect()
          .catch (e => {
            err = e;
          })
          .then(() => {
            expect(err.name).toEqual('AuthSdkError');
            expect(err.errorSummary).toEqual('PKCE requires a modern browser with encryption support running in a secure context.');
          });
      });


      it('HTTPS: rejects with a more specific error', function () {
        var err;
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
        spyOn(OktaAuth.features, 'isHTTPS').and.returnValue(false);
        var auth = new OktaAuth({
          issuer: 'https://dev-12345.oktapreview.com',
          pkce: true,
        });
        
        return auth.token.getWithRedirect()
          .catch (e => {
            err = e;
          })
          .then(() => {
            expect(err.name).toEqual('AuthSdkError');
            expect(err.errorSummary).toEqual(
              'PKCE requires a modern browser with encryption support running in a secure context.\n' +
              'The current page is not being served with HTTPS protocol. PKCE requires secure HTTPS protocol.'
            );
          });
      });

      it('TextEncoder: rejects with a more specific error', function () {
        var err;
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
        spyOn(OktaAuth.features, 'isHTTPS').and.returnValue(true);
        delete global.TextEncoder;

        var auth = new OktaAuth({
          issuer: 'https://dev-12345.oktapreview.com',
          pkce: true,
        });
        return auth.token.getWithRedirect()
          .catch (e => {
            err = e;
          })
          .then(() => {
            expect(err.name).toEqual('AuthSdkError');
            expect(err.errorSummary).toEqual(
              'PKCE requires a modern browser with encryption support running in a secure context.\n' +
              '"TextEncoder" is not defined. To use PKCE, you may need to include a polyfill/shim for this browser.'
            );
          });
      });

      it('TextEncoder & HTTPS: throw a more specific error', function () {
        var err;
        spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(false);
        spyOn(OktaAuth.features, 'isHTTPS').and.returnValue(false);
        delete global.TextEncoder;

        var auth = new OktaAuth({
          issuer: 'https://dev-12345.oktapreview.com',
          pkce: true,
        });
        return auth.token.getWithRedirect()
          .catch (e => {
            err = e;
          })
          .then(() => {
            expect(err.name).toEqual('AuthSdkError');
            expect(err.errorSummary).toEqual(
              'PKCE requires a modern browser with encryption support running in a secure context.\n' +
              'The current page is not being served with HTTPS protocol. PKCE requires secure HTTPS protocol.\n' +
              '"TextEncoder" is not defined. To use PKCE, you may need to include a polyfill/shim for this browser.'
            );
          });
      });

    });
  });
});
