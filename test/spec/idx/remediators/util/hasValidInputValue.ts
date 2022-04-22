import { hasValidInputValue } from '../../../../../lib/idx/remediators/GenericRemediator/util';

describe('hasValidInputValue - validate each input with inputValues', () => {
  
  describe('primitive input', () => {
    let input;
    beforeAll(() => {
      input = { name: 'identifier', required: true };
    });

    it('returns false when required input is missing from values', () => {
      const values = { 'identifier': undefined };
      const res = hasValidInputValue(input, values);
      expect(res).toBe(false);
    });

    it('returns true when required input can be found from values', () => {
      const values = { 'identifier': 'test@acme.com' };
      const res = hasValidInputValue(input, values);
      expect(res).toBe(true);
    });
  });

  describe('object type input with values', () => {
    let input;
    beforeAll(() => {
      input = { 
        name: 'credentials', 
        type: 'object',
        required: true,
        value: [{
          name: 'passcode',
        }]
      };
    });

    it('returns true if values can be found', () => {
      const values = { 
        credentials: {
          passcode: 'abcd'
        } 
      };
      const res = hasValidInputValue(input, values);
      expect(res).toBe(true);
    });

    it('returns false if top level name field is undefined', () => {
      const values = { credentials: undefined };
      const res = hasValidInputValue(input, values);
      expect(res).toBe(false);
    });

    it('returns false if nested name field is undefined', () => {
      const values = { 
        credentials: { 
          passcode: undefined 
        } 
      };
      const res = hasValidInputValue(input, values);
      expect(res).toBe(false);
    });
  });

});
