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

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthIdxOptions> = createIdxOptionsConstructor();
const StorageManager: IdxStorageManagerConstructor = createIdxStorageManager();
const TransactionManager: IdxTransactionManagerConstructor = createIdxTransactionManager();


const OktaAuthIdx = createOktaAuthIdx(StorageManager, OptionsConstructor, TransactionManager);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OktaAuthOptions extends OktaAuthIdxOptions {}

class OktaAuth extends OktaAuthIdx {
  constructor(options: OktaAuthOptions) {
    super(options);
  }
}

export default OktaAuth;
export { OktaAuth };
export * from './common';
export * from '../idx';
