import type {
  OktaAuthOptionsConstructor,
} from '../base/types';

import {
  IdxStorageManagerConstructor,
  IdxTransactionManagerConstructor,
  OktaAuthIdxOptions,
} from '../idx/types';
import { createIdxTransactionManager } from '../idx/IdxTransactionManager';
import { createMinimalOktaAuthIdx } from '../idx/factory/MinimalOktaAuthIdx';
import { createIdxStorageManager } from '../idx/storage';
import { createIdxOptionsConstructor } from '../idx/options';

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthIdxOptions> = createIdxOptionsConstructor();
const StorageManager: IdxStorageManagerConstructor = createIdxStorageManager();
const TransactionManager: IdxTransactionManagerConstructor = createIdxTransactionManager();

const OktaAuthIdx = createMinimalOktaAuthIdx(StorageManager, OptionsConstructor, TransactionManager);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthIdxOptions {}

class OktaAuth extends OktaAuthIdx {
  constructor(options: OktaAuthOptions) {
    super(options);
  }
}

export default OktaAuth;
export { OktaAuth };

export * from '../base/types';
export * from '../constants';
export * from '../core/types';
export * from '../errors';
export * from '../http/types';
export * from '../oidc/types';
export * from '../session/types';
export * from '../storage/types';
export * from '../util/types';

export * from '../idx/types';
