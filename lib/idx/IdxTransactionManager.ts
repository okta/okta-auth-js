import { ClearTransactionMetaOptions, TransactionManagerOptions } from '../oidc/types';
import { createTransactionManager } from '../oidc/TransactionManager';
import { IdxTransactionMeta, IntrospectOptions } from './types';
import { isRawIdxResponse } from './types/idx-js';
import { IdxStorageManagerInterface, SavedIdxResponse } from './types/storage';

export function createIdxTransactionManager
<
  M extends IdxTransactionMeta = IdxTransactionMeta,
  S extends IdxStorageManagerInterface<M> = IdxStorageManagerInterface<M>
>
()
{
  const TransactionManager = createTransactionManager<M, S>();
  return class IdxTransactionManager extends TransactionManager
  {
    constructor(options: TransactionManagerOptions) {
      super(options);
    }

    clear(options: ClearTransactionMetaOptions = {}) {
      super.clear(options);

      if (options.clearIdxResponse !== false) {
        this.clearIdxResponse();
      }
    }
    
    saveIdxResponse(data: SavedIdxResponse): void {
      if (!this.saveLastResponse) {
        return;
      }
      const storage = this.storageManager.getIdxResponseStorage();
      if (!storage) {
        return;
      }
      storage.setStorage(data);
    }

    // eslint-disable-next-line complexity
    loadIdxResponse(options?: IntrospectOptions): SavedIdxResponse | null {
      if (!this.saveLastResponse) {
        return null;
      }
      const storage = this.storageManager.getIdxResponseStorage();
      if (!storage) {
        return null;
      }
      const storedValue = storage.getStorage();
      if (!storedValue || !isRawIdxResponse(storedValue.rawIdxResponse)) {
        return null;
      }

      if (options) {
        const { stateHandle, interactionHandle } = options;
        // only perform this check if NOT using generic remediator
        if (!options.useGenericRemediator && stateHandle && storedValue.stateHandle !== stateHandle) {
          return null;
        }
        if (interactionHandle && storedValue.interactionHandle !== interactionHandle) {
          return null;
        }
      }

      return storedValue;
    }

    clearIdxResponse(): void {
      if (!this.saveLastResponse) {
        return;
      }
      const storage = this.storageManager.getIdxResponseStorage();
      storage?.clearStorage();
    }
  };
}
