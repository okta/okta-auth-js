import {
  OktaAuthOptionsConstructor,
} from '../base';
import {
  StorageManagerConstructor,
} from '../storage';
import {
  createTransactionManager,
  TransactionManagerConstructor
} from '../oidc';
import {
  createCoreOptionsConstructor,
  createCoreStorageManager,
  CoreStorageManagerInterface,
  OktaAuthCoreOptions,
} from '../core';
import { createOktaAuthMyAccount } from '../myaccount';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthCoreOptions {}

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthOptions> = createCoreOptionsConstructor();
const StorageManager: StorageManagerConstructor<CoreStorageManagerInterface> = createCoreStorageManager();
const TransactionManager: TransactionManagerConstructor = createTransactionManager();

const OktaAuthMyAccount = createOktaAuthMyAccount(StorageManager, OptionsConstructor, TransactionManager);

class OktaAuth extends OktaAuthMyAccount {
  constructor(options: OktaAuthOptions) {
    super(options);
  }
}

export default OktaAuth;
export { OktaAuth };
export * from './common';
export * from '../myaccount';

