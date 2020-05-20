declare namespace OktaAuth {
  type TransactionExistsFunction = () => boolean;
  interface TransactionExists extends TransactionExistsFunction {
    _get: (key: string) => string;
  }

  class AuthTransaction {
    constructor(sdk: OktaAuth, res?: object)
  }

  interface TransactionAPI {
    exists: TransactionExists;
    status: (args?: object) => Promise<object>;
    resume: (args?: object) => Promise<AuthTransaction>;
    introspect: (args?: object) => Promise<AuthTransaction>;
  }
}