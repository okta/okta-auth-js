/* eslint-disable @typescript-eslint/no-explicit-any */
/* global window, document */
import { OktaAuth } from '@okta/okta-auth-js';

describe('features', function() {
  let orig: Record<string, unknown> = {};
  beforeEach(() => {
    orig.crypto = window.crypto;
    orig.Uint8Array = window.Uint8Array;
    orig.TextEncoder = window.TextEncoder;
  });
  afterEach(() => {
    (window as any).crypto = orig.crypto as unknown as Crypto;
    window.Uint8Array = orig.Uint8Array as unknown  as Uint8ArrayConstructor;
    window.TextEncoder = orig.TextEncoder as unknown as any;
  });

  describe('functions exist', function() {
    var funcs = [
      'isPopupPostMessageSupported',
      'isTokenVerifySupported',
      'isPKCESupported',
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

  describe('isPopupPostMessageSupported', function() {

    it('can succeed', function() {
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(true);
    });

    it('not supported in IE < 10', function() {
      (document as any).documentMode = 9;
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(false);
    });

  });

  describe('isTokenVerifySupported', function() {
    beforeEach(function() {
      (window as any).crypto = {
        subtle: true
      };
      (window as any).Uint8Array = true;
    });

    it('can succeed', function() {
      expect(OktaAuth.features.isTokenVerifySupported()).toBe(true);
    });

    it('fails if no crypto', function() {
      (window as any).crypto = undefined;
      expect(OktaAuth.features.isTokenVerifySupported()).toBe(false);
    });

    it('fails if no Uint8Array', function() {
      (window as any).Uint8Array = undefined;
      expect(OktaAuth.features.isTokenVerifySupported()).toBe(false);
    });
  });

  describe('hasTextEncoder', function() {
    it('returns true if TextEncoder is defined', function() {
      (window as any).TextEncoder = true;
      expect(OktaAuth.features.hasTextEncoder()).toBe(true);
    });
    it('returns false if TextEncoder is undefined', function() {
      window.TextEncoder = undefined;
      expect(OktaAuth.features.hasTextEncoder()).toBe(false);
    });
  });

  describe('isPKCESupported', function() {
    beforeEach(function() {
      (window as any).crypto = {
        subtle: true
      };
      (window as any).Uint8Array = true;
      (window as any).TextEncoder = true;
    });

    it('can succeed', function() {
      expect(OktaAuth.features.isPKCESupported()).toBe(true);
    });

    it('fails if no crypto', function() {
      (window as any).crypto = undefined;
      expect(OktaAuth.features.isPKCESupported()).toBe(false);
    });

    it('fails if no Uint8Array', function() {
      (window as any).Uint8Array = undefined;
      expect(OktaAuth.features.isPKCESupported()).toBe(false);
    });

    it('fa(window as any)ils if no TextEncoder', function() {
      (window as any).TextEncoder = undefined;
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

      return auth.token.getWithoutPrompt()
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
      
      return auth.token.getWithoutPrompt()
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
      window.TextEncoder = undefined;

      var auth = new OktaAuth({
        issuer: 'https://dev-12345.oktapreview.com',
        pkce: true,
      });
      return auth.token.getWithoutPrompt()
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
      window.TextEncoder = undefined;

      var auth = new OktaAuth({
        issuer: 'https://dev-12345.oktapreview.com',
        pkce: true,
      });
      return auth.token.getWithoutPrompt()
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

  describe('isIE11OrLess', function() {
    beforeEach(() => {
      (document as any).documentMode = undefined;
    });
    it('returns false when document doesnot have documentMode', function() {
      expect((document as any).documentMode).toBeUndefined();
      expect(OktaAuth.features.isIE11OrLess()).toBe(false);
    });

    it('returns true documentMode is 11', function() {
      (document as any).documentMode = 11;
      expect(OktaAuth.features.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 10', function() {
      (document as any).documentMode = 10;
      expect(OktaAuth.features.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 9', function() {
      (document as any).documentMode = 9;
      expect(OktaAuth.features.isIE11OrLess()).toBe(true);
    });

    it('returns true documentMode is 8', function() {
      (document as any).documentMode = 8;
      expect(OktaAuth.features.isIE11OrLess()).toBe(true);
    });
  });
});
