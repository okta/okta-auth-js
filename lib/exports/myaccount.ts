import { createCoreOptionsConstructor } from '../core/options';
import { createCoreStorageManager } from '../core/storage';
import { createOktaAuthMyAccount } from '../myaccount/factory';
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
const OktaAuthMyAccount = createOktaAuthMyAccount(StorageManager, OptionsConstructor);

class OktaAuth extends OktaAuthMyAccount {
  constructor(options: OktaAuthOptions) {
    super(options);
  }
}

export default OktaAuth;
export { OktaAuth };
export * from './common';
export * from '../myaccount';

