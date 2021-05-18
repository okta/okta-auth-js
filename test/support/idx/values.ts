/* eslint-disable max-len */
import { Factory } from 'fishery';
import { IdxRemediationValue } from '../../../lib/idx/types';

interface MockedIdxRemediationValue extends IdxRemediationValue {
  _testSeq: number;

}

const IdxRemediationValueFactory = Factory.define<MockedIdxRemediationValue>(({
  sequence
}) => {
  return {
    _testSeq: sequence,
    name: 'unknown-value'
  };
});
export { IdxRemediationValueFactory };

export const UsernameValueFactory = IdxRemediationValueFactory.params({
  name: 'identifier',
  label: 'Username'
});

export const PasswordValueFactory = IdxRemediationValueFactory.params({
  name: 'credentials',
  form: {
    value: [{
      name: 'passcode',
      label: 'Password',
      secret: true
    }]
  }
});

export const AuthenticatorValueFactory = IdxRemediationValueFactory.params({
  name: 'authenticator',
  options: []
});

export const IdValueFactory = IdxRemediationValueFactory.params({
  name: 'id',
  required: true,
  value: 'unknown-id'
});

export const PhoneMethodTypeValueFactory = IdxRemediationValueFactory.params({
  name: 'methodType',
  required: true,
  options: [{
    label: 'SMS',
    value: 'sms'
  }, {
    label: 'Voice call',
    value: 'voice'
  }]
});

export const PhoneNumberValueFactory = IdxRemediationValueFactory.params({
  name: 'phoneNumber',
  required: true,
});
