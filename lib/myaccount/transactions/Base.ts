import { OktaAuthHttpInterface } from '../../http/types';

export type TransactionLink = {
  href: string;
  hints?: {
    allow?: string[];
  };
}

export type TransactionLinks = {
  self: TransactionLink;
  [property: string]: TransactionLink;
}

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

  constructor(oktaAuth: OktaAuthHttpInterface, options: TransactionOptions) {
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

export interface TransactionType<T extends BaseTransaction = BaseTransaction> extends Function {
  new (oktaAuth: OktaAuthHttpInterface, options: TransactionOptions): T;
  prototype: T;
}
