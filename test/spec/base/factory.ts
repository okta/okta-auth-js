import { createOktaAuthBase, createBaseOptionsConstructor } from '../../../lib/base';

describe('base/factory', () => {

  describe('constructor', () => {
    it('is a constructor function', () => {
      const Options = createBaseOptionsConstructor(); 
      const OktaAuth = createOktaAuthBase(Options);
      expect(typeof OktaAuth).toBe('function');
      expect(OktaAuth.prototype).toBeDefined();
      expect(OktaAuth.prototype.constructor).toBeDefined();
    });

    it('has features', () => {
      const Options = createBaseOptionsConstructor(); 
      const OktaAuth = createOktaAuthBase(Options);
      expect(OktaAuth.features).toBeDefined();
    });

    it('has constants (for commonJS)', () => {
      const Options = createBaseOptionsConstructor(); 
      const OktaAuth = createOktaAuthBase(Options);
      expect(OktaAuth.constants).toBeDefined();
      expect(OktaAuth.constants.STATE_TOKEN_KEY_NAME).toBeDefined();
    });

    it('can be instantiated with new()', () => {
      const Options = createBaseOptionsConstructor(); 
      const OktaAuth = createOktaAuthBase(Options);
      const oktaAuth = new OktaAuth();
      expect(oktaAuth).toBeDefined();
    });

  });


  describe('instance', () => {
    it('implements the OktaAuthBaseInterface', () => {
      const Options = createBaseOptionsConstructor(); 
      const OktaAuth = createOktaAuthBase(Options);
      const oktaAuth = new OktaAuth();
      expect(oktaAuth.emitter).toBeDefined();
      expect(oktaAuth.options).toBeDefined();
      expect(oktaAuth.features).toBeDefined();
    });
  });


});