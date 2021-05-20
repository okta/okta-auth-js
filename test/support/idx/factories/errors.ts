import { Factory } from 'fishery';
import { RawIdxResponse } from '../../../../lib/idx/types/idx-js';

export const IdxErrorFactory = Factory.define<RawIdxResponse>(() => {
  return {
    version: '1.0.0',
    stateHandle: 'unknown-stateHandle'
  };
});

export const IdxErrorAccessDeniedFactory = IdxErrorFactory.params({
  intent: 'LOGIN',
  messages: {
    type: 'array',
    value: [{
      class: 'ERROR',
      i18n: {
        key: 'security.access_denied'
      },
      message: 'You do not have permission to perform the requested action.'
    }]
  }
});
