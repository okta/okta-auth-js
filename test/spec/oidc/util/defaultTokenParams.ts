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
import { OktaAuth } from '../../../../lib/types';

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
      delete global.window;
    }
  });
  it('`pkce`: uses value from sdk.options', () => {
    const sdk = { options: { pkce: true } } as OktaAuth;
    expect(getDefaultTokenParams(sdk).pkce).toBe(true);
  });
  
  it('`clientId`: uses value from sdk.options', () => {
    const sdk = { options: { clientId: 'abc' } } as OktaAuth;
    expect(getDefaultTokenParams(sdk).clientId).toBe('abc');
  });
  
  describe('`redirectUri`: ', () => {
    it('isBrowser: defaults to window.location.href', () => {
      jest.spyOn(mocked.features, 'isBrowser').mockReturnValue(true);
      expect(window.location.href).toBeTruthy();
      expect(getDefaultTokenParams({ options: {} } as OktaAuth).redirectUri).toBe(window.location.href);
    });
    it('uses values from sdk.options', () => {
      const sdk = { options: { redirectUri: 'abc' } } as OktaAuth;
      expect(getDefaultTokenParams(sdk).redirectUri).toBe('abc');
    });
  });
  
  describe('`responseType`: ', () => {
    it('defaults to ["token", "id_token"]', () => {
      expect(getDefaultTokenParams({ options: {} } as OktaAuth).responseType).toEqual(['token', 'id_token']);
    });
    it('uses values from sdk.options', () => {
      const sdk = { options: { responseType: 'abc' } } as OktaAuth;
      expect(getDefaultTokenParams(sdk).responseType).toBe('abc');
    });
  });

  it('`responseMode`: uses value from sdk.options', () => {
    const sdk = { options: { responseMode: 'abc' } } as OktaAuth;
    expect(getDefaultTokenParams(sdk).responseMode).toBe('abc');
  });

  describe('`state`: ', () => {
    it('generates a default value', () => {
      expect(getDefaultTokenParams({ options: {} } as OktaAuth).state).toBeTruthy();
    });
    it('uses values from sdk.options', () => {
      const sdk = { options: { state: 'abc' } } as OktaAuth;
      expect(getDefaultTokenParams(sdk).state).toBe('abc');
    });
  });

  it('`nonce`: generates a default value', () => {
    expect(getDefaultTokenParams({ options: {} } as OktaAuth).nonce).toBeTruthy();
  });
});