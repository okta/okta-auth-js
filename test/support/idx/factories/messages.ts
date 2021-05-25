import { Factory } from 'fishery';
import { IdxMessage, IdxMessages } from '../../../../lib/idx/types/idx-js';

export const IdxMessagesFactory = Factory.define<IdxMessages>(() => {
  return {
    type: 'array',
    value: null
  };
});

export const IdxInfoMessageFactory = Factory.define<IdxMessage>(() => {
  return {
    class: 'INFO',
    i18n: {
      key: undefined
    },
    message: 'Default info message'
  };
});

export const IdxMessageCheckYourEmailFactory = IdxInfoMessageFactory.params({
  i18n: {
    key: 'idx.email.verification.required'
  },
  message: 'To finish signing in, check your email.'
});

