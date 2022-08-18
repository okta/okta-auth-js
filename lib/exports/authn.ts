import { createCoreOptionsConstructor } from '../core/options';
import { createCoreStorageManager } from '../core/storage';
import { createOktaAuthCore } from '../core/factory';
import { mixinAuthn } from '../authn';
import TransactionManager from '../oidc/TransactionManager';
import {
  CoreStorageManagerInterface,
  OktaAuthCoreOptions,
  OktaAuthOptionsConstructor,
  StorageManagerConstructor
} from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthCoreOptions {}

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthOptions> = createCoreOptionsConstructor();
const StorageManager: StorageManagerConstructor<CoreStorageManagerInterface> = createCoreStorageManager();
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
