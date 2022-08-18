import { OktaAuthConstructor } from '../base/types';
import { OktaAuthCoreInterface } from '../core/types';
import { IdxAPI, IdxTransactionManagerInterface, OktaAuthIdxInterface, OktaAuthIdxOptions } from './types';
import { IdxTransactionMeta } from './types/meta';
import { IdxStorageManagerInterface } from './types/storage';
import { createIdxAPI } from './factory/api';
import { WebauthnAPI } from './webauthn';
import * as webauthn from './webauthn';

export function mixinIdx
<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>,
  O extends OktaAuthIdxOptions<M, S> = OktaAuthIdxOptions<M, S>,
  TM extends IdxTransactionManagerInterface = IdxTransactionManagerInterface,
  TBase extends OktaAuthConstructor<O, OktaAuthCoreInterface<M, S, O, TM>>
    = OktaAuthConstructor<O, OktaAuthCoreInterface<M, S, O, TM>>
>
(Base: TBase): TBase & OktaAuthConstructor<O, OktaAuthIdxInterface<M, S, O, TM>>
{
  return class OktaAuthIdx extends Base implements OktaAuthIdxInterface<M, S, O, TM>
  {
    idx: IdxAPI;
    static webauthn: WebauthnAPI = webauthn;
    
    constructor(...args: any[]) {
      super(...args);
      this.idx = createIdxAPI(this);
    }
  };
}
