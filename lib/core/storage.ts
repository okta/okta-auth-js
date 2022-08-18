import { createOAuthStorageManager } from '../oidc/storage';
import { PKCETransactionMeta } from '../oidc/types';

export function createCoreStorageManager<M extends PKCETransactionMeta = PKCETransactionMeta>() {
  return createOAuthStorageManager<M>();
}
