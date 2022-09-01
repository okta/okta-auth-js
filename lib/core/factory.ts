import { StorageManagerConstructor } from '../storage/types';
import { OktaAuthConstructor, OktaAuthOptionsConstructor } from '../base/types';

import { OktaAuthCoreInterface, OktaAuthCoreOptions } from './types';
import { createOktaAuthBase } from '../base';
import { mixinStorage } from '../storage/mixin';
import { mixinHttp } from '../http/mixin';
import { mixinOAuth } from '../oidc/mixin';
import {
  OAuthStorageManagerInterface,
  PKCETransactionMeta,
  TransactionManagerConstructor,
  TransactionManagerInterface
} from '../oidc/types';
import { mixinCore } from './mixin';
import { mixinSession } from '../session/mixin';

export function createOktaAuthCore<
  M extends PKCETransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthCoreOptions = OktaAuthCoreOptions,
  TM extends TransactionManagerInterface = TransactionManagerInterface
>(
  StorageManagerConstructor: StorageManagerConstructor<S>,
  OptionsConstructor: OktaAuthOptionsConstructor<O>,
  TransactionManagerConstructor: TransactionManagerConstructor<TM>
): OktaAuthConstructor<OktaAuthCoreInterface<M, S, O, TM>>
{
  const Base = createOktaAuthBase(OptionsConstructor);
  const WithStorage = mixinStorage<S, O>(Base, StorageManagerConstructor);
  const WithHttp = mixinHttp<S, O>(WithStorage);
  const WithSession = mixinSession<S, O>(WithHttp);
  const WithOAuth = mixinOAuth<M, S, O, TM>(WithSession, TransactionManagerConstructor);
  const Core = mixinCore<M, S, O, TM>(WithOAuth);
  return Core;
}
