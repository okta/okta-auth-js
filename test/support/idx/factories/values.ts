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


export const FirstNameValueFactory = IdxValueFactory.params({
  'name': 'firstName',
  'label': 'First name',
  'required': true,
  'minLength': 1,
  'maxLength': 50
});

export const LastNameValueFactory = IdxValueFactory.params({
  'name': 'lastName',
  'label': 'Last name',
  'required': true,
  'minLength': 1,
  'maxLength': 50
});


export const EmailValueFactory = IdxValueFactory.params({
  'name': 'email',
  'label': 'Email',
  'required': true
});

export const NewPasswordValueFactory = IdxValueFactory.params({
  'name': 'passcode',
  'label': 'New password',
  'secret': true
});

export const PasscodeValueFactory = IdxValueFactory.params({
  'name': 'passcode',
  'label': 'Enter code',
});
