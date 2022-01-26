import { isTransactionMeta, TransactionMeta } from '../types';
import { StorageManager } from '../StorageManager';

const MAX_ENTRY_LIFETIME = 30 * 60 * 1000; // 30 minutes

export function pruneSharedStorage(storageManager: StorageManager) {
  const sharedStorage = storageManager.getSharedTansactionStorage();
  const entries = sharedStorage.getStorage();
  Object.keys(entries).forEach(state => {
    const entry = entries[state];
    const age = Date.now() - entry.dateCreated;
    if (age > MAX_ENTRY_LIFETIME) {
      delete entries[state];
    }
  });
  sharedStorage.setStorage(entries);
}

export function saveTransactionToSharedStorage(storageManager: StorageManager, state: string, meta: TransactionMeta) {
  const sharedStorage = storageManager.getSharedTansactionStorage();
  const entries = sharedStorage.getStorage();
  entries[state] = {
    dateCreated: Date.now(),
    transaction: meta
  };
  sharedStorage.setStorage(entries);
}


export function loadTransactionFromSharedStorage(storageManager: StorageManager, state: string) {
  const sharedStorage = storageManager.getSharedTansactionStorage();
  const entries = sharedStorage.getStorage();
  const entry = entries[state];
  if (entry && entry.transaction && isTransactionMeta(entry.transaction)) {
    return entry.transaction;
  }
  return null;
}

export function clearTransactionFromSharedStorage(storageManager: StorageManager, state: string) {
  const sharedStorage = storageManager.getSharedTansactionStorage();
  const entries = sharedStorage.getStorage();
  delete entries[state];
  sharedStorage.setStorage(entries);
}
