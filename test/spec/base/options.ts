import { createBaseOptionsConstructor } from '../../../lib/base';

describe('base/options', () => {

  describe('constructor', () => {
    it('is a constructor function', () => {
      const Options = createBaseOptionsConstructor(); 
      expect(typeof Options).toBe('function');
      expect(Options.prototype).toBeDefined();
      expect(Options.prototype.constructor).toBeDefined();
    });

    it('can be instantiated with new()', () => {
      const Options = createBaseOptionsConstructor(); 
      const options = new Options({});
      expect(options).toBeDefined();
    });

  });


  describe('instance', () => {
    it('implements the OktaAuthBaseOptions interface', () => {
      const Options = createBaseOptionsConstructor(); 
      const options = new Options({});
      expect(options.devMode).toBeDefined();
    });
  });
});