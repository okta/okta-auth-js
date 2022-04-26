import { GenericRemediator, Remediator } from '../../../../lib/idx/remediators';
import { OktaAuthInterface } from '../../../../lib/types';
import { IdxRemediation } from '../../../../lib/idx/types/idx-js';

describe('remediators/GenericRemediator', () => {
  let authClient = {} as OktaAuthInterface;

  it('extends Base Remediator', () => {
    const remediation = {} as IdxRemediation;
    const remediator = new GenericRemediator(authClient, remediation);
    expect(remediator).toBeInstanceOf(Remediator);
  });

  describe('Override canRemediate', () => {

  });

  describe('Override getData', () => {

  });

  describe('Override getNextStep', () => {

  });

  describe('Override getInputs', () => {

  });
  
});
