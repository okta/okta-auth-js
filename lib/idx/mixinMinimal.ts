import { OktaAuthConstructor } from '../base/types';
import { MinimalOktaOAuthInterface } from '../oidc/types';
import {
  IdxTransactionManagerInterface,
  OktaAuthIdxConstructor,
  OktaAuthIdxOptions,
  MinimalIdxAPI,
  WebauthnAPI,
  MinimalOktaAuthIdxInterface
} from './types';
import { IdxTransactionMeta } from './types/meta';
import { IdxStorageManagerInterface } from './types/storage';
import { createMinimalIdxAPI } from '../idx/factory/minimalApi';
import * as webauthn from './webauthn';

export function mixinMinimalIdx
<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>,
  O extends OktaAuthIdxOptions = OktaAuthIdxOptions,
  TM extends IdxTransactionManagerInterface = IdxTransactionManagerInterface,
  TBase extends OktaAuthConstructor<MinimalOktaOAuthInterface<M, S, O, TM>>
    = OktaAuthConstructor<MinimalOktaOAuthInterface<M, S, O, TM>>
>
(
  Base: TBase
): TBase & OktaAuthIdxConstructor<MinimalOktaAuthIdxInterface<M, S, O, TM>>
{
  return class OktaAuthIdx extends Base implements MinimalOktaAuthIdxInterface<M, S, O, TM>
  {
    idx: MinimalIdxAPI;
    static webauthn: WebauthnAPI = webauthn;
    
    constructor(...args: any[]) {
      super(...args);
      this.idx = createMinimalIdxAPI(this);
    }
  };
}
