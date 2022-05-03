import { hasValidInputValue } from '../../../../../lib/idx/remediators/GenericRemediator/util';

describe('hasValidInputValue - validate each input with inputValues', () => {

  describe('primitive input', () => {
    describe('value can be found', () => {
      it('returns true when field is required', () => {
        const input = { name: 'identifier', required: true };
        const values = { 'identifier': 'test@acme.com' };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });

      it('returns true when field is not required', () => {
        const input = { name: 'identifier' };
        const values = { 'identifier': 'test@acme.com' };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });
    });

    describe('value cannot be found', () => {
      it('returns false when field is required', () => {
        const input = { name: 'identifier', required: true };
        const values = { 'identifier': undefined };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(false);
      });

      it('returns true when field is not required', () => {
        const input = { name: 'identifier' };
        const values = { 'identifier': 'test@acme.com' };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });
    });
  });

  describe('object type with required field at top level', () => {
    describe('value can be found', () => {
      it('returns true when field is required', () => {
        const input = {
          name: 'credentials',
          type: 'object',
          required: true,
          value: [{
            name: 'passcode',
          }]
        };
        const values = {
          credentials: {
            passcode: 'abcd'
          }
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });

      it('returns true if field is not required', () => {
        const input = {
          name: 'credentials',
          type: 'object',
          value: [{
            name: 'passcode',
          }]
        };
        const values = {
          credentials: {
            passcode: 'abcd'
          }
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });

    });

    describe('value cannot be found', () => {
      it('required - returns false ', () => {
        const input = {
          name: 'credentials',
          type: 'object',
          required: true,
          value: [{
            name: 'passcode',
          }]
        };
        const values = { credentials: undefined };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(false);
      });

      it('required - returns false if nested name field is undefined', () => {
        const input = {
          name: 'credentials',
          type: 'object',
          required: true,
          value: [{
            name: 'passcode',
          }]
        };
        const values = {
          credentials: {
            passcode: undefined
          }
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(false);
      });

      it('required - returns false if main field is undefined', () => {
        const input = {
          name: 'credentials',
          type: 'object',
          required: true,
          value: [{
            name: 'passcode',
          }]
        };
        const values = {
          credentials: undefined
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(false);
      });

      it('not required - returns true if main field is undefined', () => {
        const input = {
          name: 'credentials',
          type: 'object',
          value: [{
            name: 'passcode',
          }]
        };
        const values = {
          credentials: undefined
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });

      it('not required - returns true if nested field is undefined', () => {
        const input = {
          name: 'credentials',
          type: 'object',
          value: [{
            name: 'passcode',
          }]
        };
        const values = {
          credentials: {
            passcode: undefined
          }
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });
    });
  });

  describe('nested fields with required', () => {

    describe('value can be found', () => {
      it('all fields are required - returns true', () => {
        const input = {
          name: 'userProfile',
          value: [
            { name: 'firstName', required: true },
            { name: 'email', required: true }
          ]
        };
        const values = {
          userProfile: {
            firstName: 'firstName',
            email: 'email'
          }
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });

      it('partial fields are required, all values are available - returns true', () => {
        const input = {
          name: 'userProfile',
          value: [
            { name: 'firstName', required: true },
            { name: 'email' }
          ]
        };
        const values = {
          userProfile: {
            firstName: 'firstName',
            email: 'email'
          }
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });

      it('partial fields are required, only required values are available - returns true', () => {
        const input = {
          name: 'userProfile',
          value: [
            { name: 'firstName', required: true },
            { name: 'email' }
          ]
        };
        const values = {
          userProfile: {
            firstName: 'firstName',
          }
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(true);
      });
    });

    describe('value cannnot be found', () => {
      it('all fields are required, one required field is missing - returns false', () => {
        const input = {
          name: 'userProfile',
          value: [
            { name: 'firstName', required: true },
            { name: 'email', required: true }
          ]
        };
        const values = {
          userProfile: {
            firstName: 'firstName',
          }
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(false);
      });

      it('all fields are required, all required fields are missing - returns false', () => {
        const input = {
          name: 'userProfile',
          value: [
            { name: 'firstName', required: true },
            { name: 'email', required: true }
          ]
        };
        const values = {
          userProfile: {}
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(false);
      });

      it('all fields are required, top level field is missing - returns false', () => {
        const input = {
          name: 'userProfile',
          value: [
            { name: 'firstName', required: true },
            { name: 'email', required: true }
          ]
        };
        const values = {
          userProfile: undefined
        };
        const res = hasValidInputValue(input, values);
        expect(res).toBe(false);
      });

      describe('not required', () => {
        it('returns true when fields are available', () => {
          const input = {
            name: 'userProfile',
            value: [
              { name: 'firstName' },
              { name: 'email' }
            ]
          };
          const values = {
            userProfile: {
              firstName: 'firstName',
              email: 'email'
            }
          };
          const res = hasValidInputValue(input, values);
          expect(res).toBe(true);
        });

        it('returns true when fields are missing', () => {
          const input = {
            name: 'userProfile',
            value: [
              { name: 'firstName' },
              { name: 'email' }
            ]
          };
          const values = {
            userProfile: {}
          };
          const res = hasValidInputValue(input, values);
          expect(res).toBe(true);
        });

        it('returns true when top level field is missing', () => {
          const input = {
            name: 'userProfile',
            value: [
              { name: 'firstName' },
              { name: 'email' }
            ]
          };
          const values = {
            userProfile: undefined
          };
          const res = hasValidInputValue(input, values);
          expect(res).toBe(true);
        });
      });

    });

  });

});
