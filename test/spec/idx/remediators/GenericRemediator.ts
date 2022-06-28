import { GenericRemediator, RemediationValues, Remediator } from '../../../../lib/idx/remediators';
import { OktaAuthIdxInterface } from '../../../../lib/types';
import { IdxRemediation } from '../../../../lib/idx/types/idx-js';
import { 
  IdxRemediationFactory,
  UsernameValueFactory,
  PasswordValueFactory,
  StateHandleValueFactory
} from '@okta/test.support/idx';

const mocked = {
  util: require('../../../../lib/idx/remediators/GenericRemediator/util'),
};

describe('remediators/GenericRemediator', () => {

  it('extends Base Remediator', () => {
    const remediation = {} as IdxRemediation;
    const remediator = new GenericRemediator(remediation);
    expect(remediator).toBeInstanceOf(Remediator);
  });

  // Re-enable when add client side validation in GenericRemediator
  describe.skip('Override canRemediate', () => {
    describe('single level inputs', () => {
      let remediation;
      beforeAll(() => {
        remediation = IdxRemediationFactory.build({
          name: 'foo',
          value: [
            UsernameValueFactory.build(),
          ],
          action: jest.fn()
        });
      });

      it('can remediate when required fields have value', () => {
        const values = {
          identifier: 'fake-identifier'
        } as RemediationValues;
        const remediator = new GenericRemediator(remediation, values);
        expect(remediator.canRemediate()).toBe(true);
      });

      it('cannot remediate when required fields are missing', () => {
        const values = {
          identifier: undefined
        } as RemediationValues;
        const remediator = new GenericRemediator(remediation, values);
        expect(remediator.canRemediate()).toBe(false);
      });
    });

    describe('nested inputs', () => {
      let remediation;
      beforeAll(() => {
        remediation = IdxRemediationFactory.build({
          name: 'foo',
          value: [
            UsernameValueFactory.build(),
            PasswordValueFactory.build()
          ],
          action: jest.fn()
        });
      });

      it('can remediate when required fields have value', () => {
        const values = {
          identifier: 'fake-identifier',
          credentials: {
            passcode: 'abcd'
          }
        } as RemediationValues;
        const remediator = new GenericRemediator(remediation, values);
        expect(remediator.canRemediate()).toBe(true);
      });

      it('cannot remediate when required fields are missing', () => {
        let values, remediator;
        
        // missing value that nested in object
        values = {
          identifier: 'fake-identifier',
          credentials: {
            passcode: undefined
          }
        } as RemediationValues;
        remediator = new GenericRemediator(remediation, values);
        expect(remediator.canRemediate()).toBe(false);

        // missing value from top level
        values = {
          identifier: 'fake-identifier',
        } as RemediationValues;
        remediator = new GenericRemediator(remediation, values);
        expect(remediator.canRemediate()).toBe(false);
      });
    });
  });

  describe('Override getData', () => {
    let remediation;
    beforeAll(() => {
      remediation = IdxRemediationFactory.build({
        value: [
          UsernameValueFactory.build(),
          PasswordValueFactory.build()
        ],
        action: jest.fn()
      });
    });

    it('only grabs data that exists in inputs', () => {
      const values = {
        identifier: 'fake-identifier',
        credentials: {
          passcode: 'abcd'
        },
        foo: 'bar'
      } as RemediationValues;
      const remediator = new GenericRemediator(remediation, values);
      expect(remediator.getData()).toEqual({
        identifier: 'fake-identifier',
        credentials: {
          passcode: 'abcd'
        },
      });
    });

    it('only grabs data that exists in values', () => {
      const values = {
        identifier: 'fake-identifier',
        foo: 'bar'
      } as RemediationValues;
      const remediator = new GenericRemediator(remediation, values);
      expect(remediator.getData()).toEqual({
        identifier: 'fake-identifier',
      });
    });
  });

  describe('Override getNextStep', () => {

    it('returns mapped fields for form submission remediation', async () => {
      const remediation = IdxRemediationFactory.build({
        href: 'http://fake.com', 
        method: 'POST', 
        rel: ['create-form'], 
        accepts: 'fake', 
        produces: 'fake', 
        name: 'foo',
        value: [
          UsernameValueFactory.build(),
          PasswordValueFactory.build()
        ],
        action: jest.fn()
      });
      const authClient = {
        idx: {
          proceed: jest.fn()
        }
      } as unknown as OktaAuthIdxInterface;
      const remediator = new GenericRemediator(remediation, {});
      const nextStep = remediator.getNextStep(authClient);
      expect(nextStep).toMatchObject({
        name: 'foo',
        inputs: [
          {
            'label': 'Username',
            'name': 'identifier',
            'required': true,
            'type': 'string',
          },
          {
            'name': 'credentials',
            'required': true,
            'type': 'string',
            'value': [
              {
                'label': 'Password',
                'name': 'passcode',
                'secret': true,
              },
            ],
          }
        ],
        action: expect.any(Function),
      });

      // excludes http metas and value
      const keys = Object.keys(nextStep);
      expect(keys).not.toContain('href');
      expect(keys).not.toContain('method');
      expect(keys).not.toContain('rel');
      expect(keys).not.toContain('accepts');
      expect(keys).not.toContain('produces');
      expect(keys).not.toContain('value');

      // calls proceed in the attached action function
      await nextStep.action!({ foobar: 'foobar' });
      expect(authClient.idx.proceed).toHaveBeenCalledWith({
        step: 'foo',
        foobar: 'foobar'
      });
    });

    it('returns all original fields for non form submission remediation', () => {
      const remediation = IdxRemediationFactory.build({
        href: 'http://fake.com', 
        name: 'foo',
        meta: {
          fake1: 'fake1',
          fake2: 'fake2'
        }
      });
      const authClient = {} as OktaAuthIdxInterface;
      const remediator = new GenericRemediator(remediation, {});
      const nextStep = remediator.getNextStep(authClient);
      expect(nextStep).toEqual({
        href: 'http://fake.com', 
        name: 'foo',
        meta: {
          fake1: 'fake1',
          fake2: 'fake2'
        },
        value: []
      });
    });

  });

  describe('Override getInputs', () => {
    let remediation;
    beforeAll(() => {
      remediation = IdxRemediationFactory.build({
        href: 'http://fake.com', 
        method: 'POST', 
        rel: ['create-form'], 
        accepts: 'fake', 
        produces: 'fake', 
        name: 'foo',
        value: [
          UsernameValueFactory.build(),
          StateHandleValueFactory.build()
        ],
        action: jest.fn()
      });
    });

    it('returns correct input', () => {
      jest.spyOn(mocked.util, 'unwrapFormValue');
      const remediator = new GenericRemediator(remediation);
      const inputs = remediator.getInputs();
      expect(inputs).toEqual([
        {
          label: 'Username',
          name: 'identifier',
          required: true,
          type: 'string'
        }
      ]);

      expect(mocked.util.unwrapFormValue).toHaveBeenCalledTimes(1);
    });
  });
  
});
