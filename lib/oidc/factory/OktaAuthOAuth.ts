import { StorageManagerConstructor } from '../../storage/types';
import { OktaAuthConstructor, OktaAuthOptionsConstructor } from '../../base/types';

import { createOktaAuthBase } from '../../base';
import { mixinStorage } from '../../storage/mixin';
import { mixinSession } from '../../session/mixin';
import { mixinHttp } from '../../http/mixin';
import { mixinOAuth } from '../mixin';
import {
  OAuthTransactionMeta,
  OktaAuthOAuthInterface,
  OktaAuthOAuthOptions,
  OAuthStorageManagerInterface,
  PKCETransactionMeta,
  TransactionManagerConstructor,
  TransactionManagerInterface
} from '../types';

export function createOktaAuthOAuth
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions = OktaAuthOAuthOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface
>
(
  StorageManagerConstructor: StorageManagerConstructor<S>,
  OptionsConstructor: OktaAuthOptionsConstructor<O>,
  TransactionManagerConstructor: TransactionManagerConstructor<TM>
):  OktaAuthConstructor<OktaAuthOAuthInterface<M, S, O, TM>>
{
  const Base = createOktaAuthBase(OptionsConstructor);
  const WithStorage = mixinStorage<S, O>(Base, StorageManagerConstructor);
  const WithHttp = mixinHttp<S, O>(WithStorage);
  const WithSession = mixinSession<S, O>(WithHttp);
  const WithOAuth = mixinOAuth<M, S, O, TM>(WithSession, TransactionManagerConstructor);
  return WithOAuth;
}
