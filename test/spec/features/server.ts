import { OktaAuth } from '@okta/okta-auth-js';

describe('features', function() {
  let orig: Record<string, unknown> = {};
  beforeEach(() => {
    orig.crypto = global.crypto;
    orig.Uint8Array = global.Uint8Array;
    orig.TextEncoder = global.TextEncoder;
  });
  afterEach(() => {
    global.crypto = orig.crypto as unknown as Crypto;
    global.Uint8Array = orig.Uint8Array as unknown  as Uint8ArrayConstructor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.TextEncoder = orig.TextEncoder as unknown as any;
  });

  describe('isPopupPostMessageSupported', function() {
    it('is false', function() {
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(false);
    });
  });

  describe('isTokenVerifySupported', function() {
    it('can succeed', function() {
      expect(OktaAuth.features.isTokenVerifySupported()).toBe(true);
    });

    it('fails if no crypto', function() {
      delete global.crypto;
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

    it('fails if no crypto', function() {
      delete global.crypto;
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

  describe('isIE11OrLess', function() {
    it('returns false', function() {
      expect(OktaAuth.features.isIE11OrLess()).toBe(false);
    });
  });
});
