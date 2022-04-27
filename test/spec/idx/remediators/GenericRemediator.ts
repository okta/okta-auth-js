import { GenericRemediator, RemediationValues, Remediator } from '../../../../lib/idx/remediators';
import { OktaAuthInterface } from '../../../../lib/types';
import { IdxRemediation } from '../../../../lib/idx/types/idx-js';
import { 
  IdxRemediationFactory,
  UsernameValueFactory,
  PasswordValueFactory,
  StateHandleValueFactory
} from '@okta/test.support/idx';

jest.mock('../../../../lib/idx/proceed', () => {
  return {
    proceed: jest.fn()
  };
});

const mocked = {
  proceed: require('../../../../lib/idx/proceed'),
  util: require('../../../../lib/idx/remediators/GenericRemediator/util'),
};

describe('remediators/GenericRemediator', () => {
  let authClient = {} as OktaAuthInterface;

  it('extends Base Remediator', () => {
    const remediation = {} as IdxRemediation;
    const remediator = new GenericRemediator(authClient, remediation);
    expect(remediator).toBeInstanceOf(Remediator);
  });

  describe('Override canRemediate', () => {
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
        const remediator = new GenericRemediator(authClient, remediation, values);
        expect(remediator.canRemediate()).toBe(true);
      });

      it('cannot remediate when required fields are missing', () => {
        const values = {
          identifier: undefined
        } as RemediationValues;
        const remediator = new GenericRemediator(authClient, remediation, values);
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
        const remediator = new GenericRemediator(authClient, remediation, values);
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
        remediator = new GenericRemediator(authClient, remediation, values);
        expect(remediator.canRemediate()).toBe(false);

        // missing value from top level
        values = {
          identifier: 'fake-identifier',
        } as RemediationValues;
        remediator = new GenericRemediator(authClient, remediation, values);
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
      const remediator = new GenericRemediator(authClient, remediation, values);
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
      const remediator = new GenericRemediator(authClient, remediation, values);
      expect(remediator.getData()).toEqual({
        identifier: 'fake-identifier',
      });
    });
  });

  describe('Override getNextStep', () => {
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
          PasswordValueFactory.build()
        ],
        action: jest.fn()
      });
    });

    it('returns with correct fields', async () => {
      const remediator = new GenericRemediator(authClient, remediation, {});
      const nextStep = remediator.getNextStep();
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
      expect(mocked.proceed.proceed).toHaveBeenCalledWith(authClient, {
        step: 'foo',
        foobar: 'foobar'
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
      const remediator = new GenericRemediator(authClient, remediation);
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
