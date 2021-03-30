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

describe('features (server)', function() {

  describe('isPopupPostMessageSupported', function() {
    it('is false', function() {
      expect(OktaAuth.features.isPopupPostMessageSupported()).toBe(false);
    });
  });

  describe('isIE11OrLess', function() {
    it('returns false', function() {
      expect(OktaAuth.features.isIE11OrLess()).toBe(false);
    });
  });
});
