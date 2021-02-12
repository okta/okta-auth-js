
jest.mock('../../../lib/oidc', () => {
  const origModule = jest.requireActual('../../../lib/oidc');
  return Object.assign({}, origModule, {
    isInteractionRequiredError: jest.fn(),
    isInteractionRequired: jest.fn()
  });
});

import { 
  OktaAuth
} from '@okta/okta-auth-js';
import * as constants from '../../../lib/constants';
import * as oidc from '../../../lib/oidc';

describe('commonJS interface', () => {
  let auth;
  let issuer;
  describe('instance', () => {
    beforeEach(() => {
      issuer =  'http://my-okta-domain';
      auth = new OktaAuth({ issuer, pkce: false });
    });

    describe('isInteractionRequired', () => {
      it('calls OIDC utility', () => {
        oidc.isInteractionRequired.mockReturnValue(true);
        const res = auth.isInteractionRequired();
        expect(res).toBe(true);
        expect(oidc.isInteractionRequired).toHaveBeenCalledWith(auth);
      });
    });
    describe('isInteractionRequiredError', () => {
      it('calls OIDC utility', () => {
        oidc.isInteractionRequiredError.mockReturnValue(true);
        const fakeError = { foo: 'bar' };
        const res = auth.isInteractionRequiredError(fakeError);
        expect(res).toBe(true);
        expect(oidc.isInteractionRequiredError).toHaveBeenCalledWith(fakeError);
      });
    });
  });

  describe('static type', () => {
    it('exposes features on type and prototype', () => {
      expect(OktaAuth.features).toBeTruthy();
      expect(OktaAuth.prototype.features).toBeTruthy();
    });
    it('exposes constants', () => {
      expect(OktaAuth.constants).toBeTruthy();
      const keys = Object.keys(constants);
      expect(keys.length).toBeGreaterThan(0);
      keys.forEach(key => {
        expect(OktaAuth.constants[key]).toBe(constants[key]);
      });
    });
    it('exposes `isInteractionRequiredError`', () => {
      expect(typeof OktaAuth.isInteractionRequiredError).toBe('function');
    });
  });
});
