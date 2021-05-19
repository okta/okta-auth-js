import { IdxResponse } from '../../../lib/idx/types';

export function chainResponses(responses: IdxResponse[]) {
  for (let i = 0; i < responses.length; i++) {
    if (i < responses.length - 1) {
      responses[i].proceed = () => Promise.resolve(responses[i+1]);
    }
  }
}
