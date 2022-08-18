import { createCoreOptionsConstructor } from '../core/options';
import { createCoreStorageManager } from '../core/storage';
import { createOktaAuthCore } from '../core/factory';
import TransactionManager from '../oidc/TransactionManager';
import {
  CoreStorageManagerInterface,
  OktaAuthCoreOptions,
  OktaAuthOptionsConstructor,
  StorageManagerConstructor
} from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthCoreOptions {}

const _OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthOptions> = createCoreOptionsConstructor();
const StorageManager: StorageManagerConstructor<CoreStorageManagerInterface> = createCoreStorageManager();

const OktaAuthCore = createOktaAuthCore(StorageManager, _OptionsConstructor, TransactionManager);


class OktaAuth extends OktaAuthCore {
  constructor(options: OktaAuthOptions) {
    super(options);
  }
}


export default OktaAuth;
export { OktaAuth };
export * from './common';
