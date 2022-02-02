import { RemediationValues, Remediator } from '../../../../lib/idx/remediators';
import {
  IdentifyRemediationFactory,
} from '@okta/test.support/idx';

describe('remediators/Base/Remediator', () => {

  describe('constructor', () => {
    it('sets the remediation', () => {
      const remediation = IdentifyRemediationFactory.build();
      const r = new Remediator(remediation);
      expect(r.remediation).toBe(remediation);
    });
    it('sets the authenticator', () => {
      const remediation = IdentifyRemediationFactory.build();
      const values = { authenticator: 'foo' };
      const r = new Remediator(remediation, values);
      expect(r.values.authenticator).toBe('foo');
    });
  });

  describe('formatAuthenticators', () => {
    it('formats a list of authenticators passed as strings', () => {
      const remediation = IdentifyRemediationFactory.build();
      const authenticators = [
        'okta_verify',
        'okta_password'
      ];
      const r = new Remediator(remediation, { authenticators });
      expect(r.values.authenticators).toEqual([{
        key: 'okta_verify'
      }, {
        key: 'okta_password'
      }]);

    });
  
    it('formats a list of authenticators passed as objects', () => {
      const remediation = IdentifyRemediationFactory.build();
      const authenticators = [{
        key: 'okta_verify'
      }, {
        key: 'okta_password'
      }];
      const r = new Remediator(remediation, { authenticators });
      expect(r.values.authenticators).toEqual([{
        key: 'okta_verify'
      }, {
        key: 'okta_password'
      }]);
    });

    it('formats a list of authenticators passed as strings and objects', () => {
      const remediation = IdentifyRemediationFactory.build();
      const authenticators = [{
        key: 'okta_verify'
      },
      'okta_password'
      ];
      const r = new Remediator(remediation, { authenticators });
      expect(r.values.authenticators).toEqual([{
        key: 'okta_verify'
      }, {
        key: 'okta_password'
      }]);
    });

    it('adds authenticator (string) to the list of authenticators', () => {
      const remediation = IdentifyRemediationFactory.build();
      const authenticator = 'okta_password';
      const r = new Remediator(remediation, { authenticator });
      expect(r.values.authenticators).toEqual([{
        key: 'okta_password'
      }]);
    });

    it('adds authenticator (object) to the list of authenticators', () => {
      const remediation = IdentifyRemediationFactory.build();
      const authenticator = {
        key: 'okta_password'
      };
      const r = new Remediator(remediation, { authenticator });
      expect(r.values.authenticators).toEqual([{
        key: 'okta_password'
      }]);
    });
  });


  describe('getName', () => {
    it('returns the remediation name', () => {
      const remediation = IdentifyRemediationFactory.build();
      const r = new Remediator(remediation);
      expect(r.getName()).toBe(remediation.name);
    });
  });

  describe('canRemediate', () => {
    // TODO
  });

  describe('getData', () => {
    it('if no key is passed, it returns all data', () => {
      // TODO
    });

    it('by default will return the value by key', () => {
      const remediation = IdentifyRemediationFactory.build();
      const authenticator = 'foo';
      const rmd8r = new Remediator(remediation, { authenticator });
      const res = rmd8r.getData('authenticator');
      expect(res).toBe('foo');
    });

    it('with map will return the value by key if no match in the map', () => {
      const remediation = IdentifyRemediationFactory.build();
      const authenticator = 'foo';
      const rmd8r = new Remediator(remediation, { authenticator });
      rmd8r.map = { authenticator: ['bar'] };
      const res = rmd8r.getData('authenticator');
      expect(res).toBe('foo');
    });

    it('with map can return the value by mapped key', () => {
      const remediation = IdentifyRemediationFactory.build();
      const bar = 'foo';
      const rmd8r = new Remediator(remediation, { bar } as unknown as RemediationValues);
      rmd8r.map = { authenticator: ['bar'] };
      const res = rmd8r.getData('authenticator');
      expect(res).toBe('foo');
    });

    // TODO - add tests covering map functions
  });

  describe('hasData', () => {
    // TODO
  });

  describe('getNextStep', () => {
    // TODO
  });

  describe('getInputs', () => {
    // TODO
  });

  describe('getMessages', () => {
    // TODO
  });

  describe('getAuthenticator', () => {
    // TODO
  });
});