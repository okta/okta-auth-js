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
import { mixinAuthn } from '../authn';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthCoreOptions {}

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthOptions> = createCoreOptionsConstructor();
const StorageManager: StorageManagerConstructor<CoreStorageManagerInterface> = createCoreStorageManager();
const TransactionManager: TransactionManagerConstructor = createTransactionManager();
const Core = createOktaAuthCore(StorageManager, OptionsConstructor, TransactionManager);
const WithAuthn = mixinAuthn(Core);

class OktaAuth extends WithAuthn {
  constructor(options: OktaAuthOptions) {
    super(options);
  }
}

export default OktaAuth;
export { OktaAuth };
export * from './common';
export * from '../authn';
