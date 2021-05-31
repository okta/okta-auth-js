import { Remediator, RemediationValues } from './Remediator';
import { Authenticator } from '../../types';
import { IdxRemediationValue, IdxOption, IdxRemediation } from '../../types/idx-js';

export type AuthenticatorDataValues = RemediationValues & {
  methodType?: string;
};

// Base class - DO NOT expose static remediationName
export class AuthenticatorData extends Remediator {

  map = {
    'authenticator': []
  };

  values: AuthenticatorDataValues;

  constructor(remediation: IdxRemediation, values: AuthenticatorDataValues = {}) {
    super(remediation, values);

    // Unify authenticator input type
    const { authenticators } = this.values;
    const authenticatorType = this.getRelatesToType();
    const authenticator = (authenticators as Authenticator[])
        ?.find(authenticator => authenticator.type === authenticatorType);
    if (authenticator) {
      // map
      this.values.authenticators = authenticators.map(authenticator => {
        if (authenticatorType === authenticator.type) {
          return this.generateAuthenticatorFromValues();
        }
        return authenticator;
      });
    } else {
      // add
      this.values.authenticators = [
        ...authenticators, 
        this.generateAuthenticatorFromValues()
      ] as Authenticator[];
    }
  }

  getNextStep() {
    const common = super.getNextStep();
    const options = this.getMethodTypes();
    return { ...common, options };
  }

  // Grab authenticator from authenticators list
  protected getAuthenticatorFromValues(): Authenticator {
    if (!this.values.authenticators) {
      return null;
    }

    const authenticatorType = this.getRelatesToType();
    const authenticator = (this.values.authenticators as Authenticator[])
      .find(authenticator => authenticator.type === authenticatorType);
    return authenticator;
  }

  // Generate authenticator from user inputs
  protected generateAuthenticatorFromValues(): Authenticator {
    const type = this.getRelatesToType();
    const { methodType } = this.values;
    return { type, methodType };
  }

  protected getAuthenticatorFromRemediation(): IdxRemediationValue {
    const authenticator = this.remediation.value
      .find(({ name }) => name === 'authenticator');
    return authenticator;
  }

  private getMethodTypes(): IdxOption[] {
    const authenticator: IdxRemediationValue = this.getAuthenticatorFromRemediation();
    return authenticator.form.value.find(({ name }) => name === 'methodType').options;
  }
}
