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
  createOktaAuthCore,
  CoreStorageManagerInterface,
  OktaAuthCoreOptions,
} from '../core';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthCoreOptions {}

const _OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthOptions> = createCoreOptionsConstructor();
const StorageManager: StorageManagerConstructor<CoreStorageManagerInterface> = createCoreStorageManager();
const TransactionManager: TransactionManagerConstructor = createTransactionManager();
const OktaAuthCore = createOktaAuthCore(StorageManager, _OptionsConstructor, TransactionManager);

class OktaAuth extends OktaAuthCore {
  constructor(options: OktaAuthOptions) {
    super(options);
  }
}


export default OktaAuth;
export { OktaAuth };
export * from './common';
