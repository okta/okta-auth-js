import { OktaAuthConstructor } from '../base/types';
import { OktaAuthOAuthInterface } from '../oidc/types';
import {
  IdxAPI, 
  IdxTransactionManagerInterface, 
  OktaAuthIdxInterface, 
  OktaAuthIdxConstructor, 
  OktaAuthIdxOptions, 
  WebauthnAPI
} from './types';
import { IdxTransactionMeta } from './types/meta';
import { IdxStorageManagerInterface } from './types/storage';
import { createIdxAPI } from './factory/api';
import * as webauthn from './webauthn';

export function mixinIdx
<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>,
  O extends OktaAuthIdxOptions = OktaAuthIdxOptions,
  TM extends IdxTransactionManagerInterface = IdxTransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
    = OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
>
(Base: TBase): TBase & OktaAuthIdxConstructor<OktaAuthIdxInterface<M, S, O, TM>>
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
