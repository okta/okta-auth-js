import {
  OktaAuthOptionsConstructor,
} from '../base';

import {
  IdxStorageManagerConstructor,
  IdxTransactionManagerConstructor,
  OktaAuthIdxOptions,
  createIdxTransactionManager,
  createOktaAuthIdx,
  createIdxStorageManager,
  createIdxOptionsConstructor
} from '../idx';

import { mixinMyAccount } from '../myaccount';
import { mixinAuthn } from '../authn';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthIdxOptions {}

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthOptions> = createIdxOptionsConstructor();
const StorageManager: IdxStorageManagerConstructor = createIdxStorageManager();
const TransactionManager: IdxTransactionManagerConstructor = createIdxTransactionManager();

// Default bundle includes everything
const WithIdx = createOktaAuthIdx(StorageManager, OptionsConstructor, TransactionManager);
const WithMyAccount = mixinMyAccount(WithIdx);
const WithAuthn = mixinAuthn(WithMyAccount);

class OktaAuth extends WithAuthn {
  constructor(options: OktaAuthOptions) {
    super(options);
  }
}

export default OktaAuth;
export { OktaAuth };
export * from './common';
export * from '../idx';
export * from '../myaccount';
export * from '../authn';
