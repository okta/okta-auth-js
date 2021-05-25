import { Factory } from 'fishery';
import { IdxMessage } from '../../../../lib/idx/types/idx-js';



export const IdxErrorMessageFactory = Factory.define<IdxMessage>(() => {
  return {
    class: 'ERROR',
    i18n: {
      key: undefined
    },
    message: 'Default error message'
  };
});

interface IdxErrorNoAccountWithUsernameTransientParams {
  username?: string;
}

export const IdxErrorNoAccountWithUsernameFactory = Factory.define<IdxMessage, IdxErrorNoAccountWithUsernameTransientParams>(({
  transientParams
}) => {
  return {
    message: `There is no account with the Username ${transientParams.username}.`,
    i18n: {
        key: 'idx.unknown.user',
        params: []
    },
    class: 'INFO'
  };
});

export const IdxErrorAccessDeniedFactory = IdxErrorMessageFactory.params({
  i18n: { key: 'security.access_denied' },
  message: 'You do not have permission to perform the requested action.'
});

export const IdxErrorIncorrectPassword = IdxErrorMessageFactory.params({
  i18n: { key: 'incorrectPassword' },
  message: 'Password is incorrect'
});

export const IdxErrorUserNotAssignedFactory = IdxErrorMessageFactory.params({
  i18n: undefined, // this error does not have an i18n key
  message: 'User is not assigned to this application'
});

export const IdxErrorAuthenticationFailedFactory = IdxErrorMessageFactory.params({
  i18n: { key: 'errors.E0000004' },
  message: 'Authentication failed'
});

export const IdxErrorResetPasswordNotAllowedFactory = IdxErrorMessageFactory.params({
  i18n: undefined, // this error does not have an i18n key
  message: 'Reset password is not allowed at this time. Please contact support for assistance.'
});

export const IdxErrorEnrollmentInvalidPhoneFactory = IdxErrorMessageFactory.params({
  i18n: undefined, // this error does not have an i18n key
  message: 'Unable to initiate factor enrollment: Invalid Phone Number.'
});

export const IdxErrorInvalidLoginEmailFactory = IdxErrorMessageFactory.params({
  i18n: { key: 'registration.error.invalidLoginEmail', params: ['Email'] },
  message: '\'Email\' must be in the form of an email address'
});

export const IdxErrorDoesNotMatchPattern = IdxErrorMessageFactory.params({
  i18n: { key: 'registration.error.doesNotMatchPattern' },
  message: 'Provided value for property \'Email\' does not match required pattern'
});
