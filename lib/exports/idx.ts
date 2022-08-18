import { IdxTransactionManager } from '../idx/IdxTransactionManager';
import { createOktaAuthIdx } from '../idx/factory';
import { createIdxStorageManager } from '../idx/storage';
import {
  IdxStorageManagerInterface,
  OktaAuthIdxOptions,
  OktaAuthOptionsConstructor,
  StorageManagerConstructor } from '../types';
import { createIdxOptionsConstructor } from '../idx/options';

const OptionsConstructor: OktaAuthOptionsConstructor<OktaAuthIdxOptions> = createIdxOptionsConstructor();
const StorageManager: StorageManagerConstructor<IdxStorageManagerInterface>
  = createIdxStorageManager();

const OktaAuthIdx = createOktaAuthIdx(StorageManager, OptionsConstructor, IdxTransactionManager);

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
