import { OktaAuthInterface } from '../../types';
import { TransactionLink } from '../request';

type TransactionOptions = {
  // TODO: move res type to http module
  res: {
    headers: Record<string, string>;
    _links?: Record<string, TransactionLink>;
    [property: string]: unknown;
  };
  accessToken: string;
};
export default class BaseTransaction {
  // Deprecated
  headers?: Record<string, string>;

  constructor(oktaAuth: OktaAuthInterface, options: TransactionOptions) {
    const { res } = options;
    const { headers, ...rest } = res;
    
    // assign required fields from res
    if (headers) {
      this.headers = headers;
    }

    // add all rest fields from res
    Object.keys(rest).forEach(key => {
      if (key === '_links') {
        return;
      }
      this[key] = rest[key];
    });
  }
}
