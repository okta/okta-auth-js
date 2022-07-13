import { IdxTransactionManager } from '../idx/IdxTransactionManager';
import { createOktaAuthIdx } from '../idx/factory';
import { mixinMyAccount } from '../myaccount/mixin';
import { mixinAuthn } from '../authn/mixin';
import {
  IdxStorageManagerInterface,
  OktaAuthIdxOptions,
  OktaAuthOptionsConstructor,
  StorageManagerConstructor
} from '../types';
import { createIdxOptionsConstructor } from '../idx/options';
import { createIdxStorageManager } from '../idx/storage';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthIdxOptions {}

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthOptions> = createIdxOptionsConstructor();
const StorageManager: StorageManagerConstructor<IdxStorageManagerInterface> = createIdxStorageManager();

// Default bundle includes everything
const WithIdx = createOktaAuthIdx(StorageManager, OptionsConstructor, IdxTransactionManager);
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
