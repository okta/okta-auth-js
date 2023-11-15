import { OktaAuthConstructor } from '../base/types';
import { OktaAuthBaseOAuthInterface } from '../oidc/types';
import {
  IdxTransactionManagerInterface, 
  OktaAuthIdxInterface, 
  OktaAuthIdxConstructor, 
  OktaAuthIdxOptions,
  BaseIdxAPI,
  WebauthnAPI,
  OktaAuthBaseIdxInterface
} from './types';
import { IdxTransactionMeta } from './types/meta';
import { IdxStorageManagerInterface } from './types/storage';
import { createBaseIdxAPI } from '../idx/factory/baseApi';
import * as webauthn from './webauthn';

export function mixinBaseIdx
<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>,
  O extends OktaAuthIdxOptions = OktaAuthIdxOptions,
  TM extends IdxTransactionManagerInterface = IdxTransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthBaseOAuthInterface<M, S, O, TM>>
    = OktaAuthConstructor<OktaAuthBaseOAuthInterface<M, S, O, TM>>
>
(
  Base: TBase
): TBase & OktaAuthIdxConstructor<OktaAuthBaseIdxInterface<M, S, O, TM>>
{
  return class OktaAuthIdx extends Base implements OktaAuthBaseIdxInterface<M, S, O, TM>
  {
    idx: BaseIdxAPI;
    static webauthn: WebauthnAPI = webauthn;
    
    constructor(...args: any[]) {
      super(...args);
      this.idx = createBaseIdxAPI(this as unknown as OktaAuthIdxInterface<M, S, O, TM>);
    }
  };
}
