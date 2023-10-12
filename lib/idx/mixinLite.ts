import { OktaAuthConstructor } from '../base/types';
import { OktaAuthOAuthInterfaceLite } from '../oidc/types';
import {
  IdxTransactionManagerInterface, 
  OktaAuthIdxInterface, 
  OktaAuthIdxConstructorLite, 
  OktaAuthIdxOptions,
  IdxAPILite,
  WebauthnAPI,
  OktaAuthIdxInterfaceLite
} from './types';
import { IdxTransactionMeta } from './types/meta';
import { IdxStorageManagerInterface } from './types/storage';
import { createIdxAPILite } from '../idx/factory/apiLite';
import * as webauthn from './webauthn';

export function mixinIdxLite
<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>,
  O extends OktaAuthIdxOptions = OktaAuthIdxOptions,
  TM extends IdxTransactionManagerInterface = IdxTransactionManagerInterface,
  TBase extends OktaAuthConstructor<OktaAuthOAuthInterfaceLite<M, S, O, TM>>
    = OktaAuthConstructor<OktaAuthOAuthInterfaceLite<M, S, O, TM>>
>
(
  Base: TBase
): TBase & OktaAuthIdxConstructorLite<OktaAuthIdxInterfaceLite<M, S, O, TM>>
{
  return class OktaAuthIdx extends Base implements OktaAuthIdxInterfaceLite<M, S, O, TM>
  {
    idx: IdxAPILite;
    static webauthn: WebauthnAPI = webauthn;
    
    constructor(...args: any[]) {
      super(...args);
      this.idx = createIdxAPILite(this as unknown as OktaAuthIdxInterface<M, S, O, TM>);
    }
  };
}
