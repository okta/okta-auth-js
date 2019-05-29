import OktaAuth from '@okta/okta-auth-js';

describe('features', function() {

  // Assumes our test browser is genuinely capable of these features.
  describe('expected results in test browser', () => {

    it('isPopupPostMessageSupported', () => {
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(true);
    });

    it('isTokenVerifySupported', () => {
      expect(OktaAuth.features.isTokenVerifySupported()).toBe(true);
    });

    it('isPKCESupported', () => {
      expect(OktaAuth.features.isPKCESupported()).toBe(true);
    });

  });

});
