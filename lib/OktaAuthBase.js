import { assertValidConfig } from './builderUtil';
import { removeTrailingSlash } from './util';
import {
  transactionStatus,
  resumeTransaction,
  transactionExists,
  introspect,
  postToTransaction
} from './tx';

export default class OktaAuthBase {
  constructor(args) {
    assertValidConfig(args);
    this.options = {
      issuer: removeTrailingSlash(args.issuer),
      httpRequestClient: args.httpRequestClient,
      storageUtil: args.storageUtil,
      headers: args.headers
    };

    this.tx = {
      status: transactionStatus.bind(null, this),
      resume: resumeTransaction.bind(null, this),
      exists: Object.assign(transactionExists.bind(null, this), {
        _get: (name) => {
          const storage = this.options.storageUtil.storage;
          return storage.get(name);
        }
      }),
      introspect: introspect.bind(null, this)
    };
    
  }

  getIssuerOrigin() {
    // Infer the URL from the issuer URL, omitting the /oauth2/{authServerId}
    return this.options.issuer.split('/oauth2/')[0];
  }

  // { username, (relayState) }
  forgotPassword(opts) {
    return postToTransaction(this, '/api/v1/authn/recovery/password', opts);
  }

  // { username, (relayState) }
  unlockAccount(opts) {
    return postToTransaction(this, '/api/v1/authn/recovery/unlock', opts);
  }

  // { recoveryToken }
  verifyRecoveryToken(opts) {
    return postToTransaction(this, '/api/v1/authn/recovery/token', opts);
  }

}
