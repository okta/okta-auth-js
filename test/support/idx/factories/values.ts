import { Factory } from 'fishery';
import { IdxRemediationValue } from '../../../../lib/idx/types/idx-js';
import { PasswordFormFactory } from './forms';

export const IdxValueFactory = Factory.define<IdxRemediationValue>(() => {
  return {
    name: 'unknown-name'
  };
});

export const UsernameValueFactory = IdxValueFactory.params({
  name: 'identifier',
  label: 'Username'
});

export const CredentialsValueFactory = IdxValueFactory.params({
  name: 'credentials',
  required: true
});

export const PasswordValueFactory = CredentialsValueFactory.afterBuild(res => {
  res.form = PasswordFormFactory.build();
});

export const AuthenticatorValueFactory = IdxValueFactory.params({
  name: 'authenticator'
});

export const IdValueFactory = IdxValueFactory.params({
  name: 'id',
  required: true,
  value: 'unknown-id-value'
});

export const PhoneMethodTypeValueFactory = IdxValueFactory.params({
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

export const PhoneNumberValueFactory = IdxValueFactory.params({
  name: 'phoneNumber',
  required: true,
});
